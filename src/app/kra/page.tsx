import { kraAgents } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import { formatCurrency } from "@/lib/utils";
import { Trophy, TrendingUp, Target, DollarSign } from "lucide-react";

const totals = {
  submitted: kraAgents.reduce((s, a) => s + a.submitted, 0),
  issued: kraAgents.reduce((s, a) => s + a.issued, 0),
  premium: kraAgents.reduce((s, a) => s + a.premium, 0),
};

export default function KRAPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">KRA Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">Agent performance leaderboard — March 2026</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10"><Target className="h-5 w-5 text-accent-blue" /></div>
          <div><p className="text-2xl font-bold">{totals.submitted}</p><p className="text-xs text-text-secondary">Submitted</p></div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/10"><TrendingUp className="h-5 w-5 text-accent-green" /></div>
          <div><p className="text-2xl font-bold">{totals.issued}</p><p className="text-xs text-text-secondary">Issued</p></div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-amber/10"><DollarSign className="h-5 w-5 text-accent-amber" /></div>
          <div><p className="text-2xl font-bold">{formatCurrency(totals.premium)}</p><p className="text-xs text-text-secondary">Total Premium</p></div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple/10"><Trophy className="h-5 w-5 text-accent-purple" /></div>
          <div><p className="text-2xl font-bold">{Math.round((totals.issued / totals.submitted) * 100)}%</p><p className="text-xs text-text-secondary">Close Rate</p></div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader><CardTitle>Agent Leaderboard</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-text-tertiary">
                <th className="pb-3 pl-3 w-10">#</th>
                <th className="pb-3">Agent</th>
                <th className="pb-3">Role</th>
                <th className="pb-3 text-right">Submitted</th>
                <th className="pb-3 text-right">Issued</th>
                <th className="pb-3 text-right">Rate</th>
                <th className="pb-3 text-right pr-3">Premium</th>
              </tr>
            </thead>
            <tbody>
              {kraAgents.map((a, i) => (
                <tr key={a.name} className="border-b border-border-subtle/50 hover:bg-bg-hover transition-colors">
                  <td className="py-3 pl-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      i === 0 ? "bg-accent-amber/20 text-accent-amber" : i === 1 ? "bg-text-secondary/20 text-text-secondary" : i === 2 ? "bg-accent-amber/10 text-accent-amber/70" : "bg-bg-tertiary text-text-tertiary"
                    }`}>{i + 1}</span>
                  </td>
                  <td className="py-3 font-medium">{a.name}</td>
                  <td className="py-3 text-text-secondary">{a.role}</td>
                  <td className="py-3 text-right font-mono">{a.submitted}</td>
                  <td className="py-3 text-right font-mono">{a.issued}</td>
                  <td className="py-3 text-right font-mono text-accent-green">{Math.round((a.issued / a.submitted) * 100)}%</td>
                  <td className="py-3 text-right pr-3 font-mono">{formatCurrency(a.premium)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
