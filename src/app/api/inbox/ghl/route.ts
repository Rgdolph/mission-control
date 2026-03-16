import { NextResponse } from "next/server";

interface GHLConversation {
  id: string;
  contactId: string;
  fullName: string;
  contactName: string;
  email: string;
  phone: string;
  lastMessageBody: string;
  lastMessageDate: number;
  lastMessageType: string;
  lastMessageDirection: string;
  unreadCount: number;
  type: string;
  assignedTo: string;
}

// Ryan's GHL user ID
const RYAN_USER_ID = "L2myudaZkCjtUV4VXZzj";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assignedFilter = searchParams.get("assigned") || "mine"; // mine | all
  
  try {
    // Build query - fetch more to allow client-side filtering
    const params = new URLSearchParams({
      locationId: process.env.GHL_LOCATION_ID || "",
      limit: "50",
      sortBy: "last_message_date",
      sortOrder: "desc",
    });

    // If filtering to "mine", add assignedTo param
    if (assignedFilter === "mine") {
      params.set("assignedTo", RYAN_USER_ID);
    }

    const res = await fetch(
      `https://services.leadconnectorhq.com/conversations/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GHL_PIT_KEY}`,
          Version: "2021-07-28",
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GHL API error ${res.status}: ${err}`);
    }

    const data = await res.json();

    const messages = (data.conversations || [])
      .filter((c: GHLConversation) => {
        const dir = c.lastMessageDirection;
        const msgType = (c.lastMessageType || "").toUpperCase();

        // Only allow actual inbound client messages (SMS, email, chat)
        const ALLOWED_TYPES = ["TYPE_SMS", "TYPE_EMAIL", "TYPE_LIVE_CHAT", "TYPE_FB", "TYPE_FACEBOOK", "TYPE_WEBCHAT", "TYPE_IG", "TYPE_INSTAGRAM"];
        if (!ALLOWED_TYPES.some(t => msgType.includes(t.replace("TYPE_", "")))) return false;
        // Must be inbound
        if (dir !== "inbound") return false;

        return true;
      })
      .map((c: GHLConversation) => {
        const msgType = (c.lastMessageType || c.type || "").toUpperCase();
        let channelLabel = "Flight Message";
        if (msgType.includes("SMS") || msgType.includes("PHONE")) channelLabel = "SMS";
        if (msgType.includes("EMAIL")) channelLabel = "Email (Flight)";
        if (msgType.includes("CALL")) channelLabel = "Inbound Call";
        if (msgType.includes("FB") || msgType.includes("FACEBOOK")) channelLabel = "Facebook";
        if (msgType.includes("LIVE_CHAT") || msgType.includes("WEBCHAT")) channelLabel = "Web Chat";

        return {
          id: c.id,
          type: "ghl" as const,
          from: c.fullName || c.contactName || c.phone || "Unknown",
          fromEmail: c.email,
          phone: c.phone,
          subject: channelLabel,
          snippet: (c.lastMessageBody || "").slice(0, 200),
          time: new Date(c.lastMessageDate).toISOString(),
          read: c.unreadCount === 0,
          direction: c.lastMessageDirection,
          contactId: c.contactId,
          assignedTo: c.assignedTo,
          messageType: msgType,
        };
      });

    return NextResponse.json({ messages, total: data.total });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GHL API error:", message);
    return NextResponse.json({ error: message, messages: [] }, { status: 500 });
  }
}
