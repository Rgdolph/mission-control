import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000/api/auth/google/callback",
      }),
    });

    const data = await res.json();
    if (!data.access_token) {
      return NextResponse.json({ error: "Token exchange failed", details: data }, { status: 500 });
    }

    // Save tokens to google-tokens.json in workspace
    const workspacePath = join(process.cwd(), "..");
    const tokensPath = join(workspacePath, "google-tokens.json");
    
    let existingTokens: Record<string, unknown> = {};
    if (existsSync(tokensPath)) {
      existingTokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
    }

    const newTokens = {
      ...existingTokens,
      access_token: data.access_token,
      refresh_token: data.refresh_token || existingTokens.refresh_token,
      scope: data.scope,
      token_type: data.token_type,
      expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
    };

    writeFileSync(tokensPath, JSON.stringify(newTokens, null, 2));

    // Also update .env.local if we got a new refresh token
    if (data.refresh_token) {
      const envPath = join(process.cwd(), ".env.local");
      if (existsSync(envPath)) {
        let envContent = readFileSync(envPath, "utf-8");
        envContent = envContent.replace(
          /GOOGLE_REFRESH_TOKEN=.*/,
          `GOOGLE_REFRESH_TOKEN=${data.refresh_token}`
        );
        writeFileSync(envPath, envContent);
      }
    }

    // Redirect back to inbox
    return NextResponse.redirect(new URL("/inbox?gmail_auth=success", req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
