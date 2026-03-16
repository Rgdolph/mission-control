// ── Mock Data for Mission Control ──

export const tasks = [
  { id: "1", title: "Follow up Dawn Shad - UNL", status: "in-progress", priority: "high", due: "2026-03-16", owner: "Ryan" },
  { id: "2", title: "Medicare 101 Webinar follow-up", status: "backlog", priority: "high", due: "2026-03-17", owner: "Ryan" },
  { id: "3", title: "Send Google Reviews text to Joy D", status: "backlog", priority: "medium", due: "2026-03-17", owner: "Ryan" },
  { id: "4", title: "Call Janet Jo re: HI and Cancer", status: "in-progress", priority: "high", due: "2026-03-16", owner: "Ryan" },
  { id: "5", title: "Mizoroski cards follow-up", status: "backlog", priority: "low", due: "2026-03-18", owner: "Terry" },
  { id: "6", title: "Proven IT copier discussion", status: "review", priority: "medium", due: "2026-03-17", owner: "Ryan" },
  { id: "7", title: "VSL Script review", status: "review", priority: "medium", due: "2026-03-19", owner: "Ryan" },
  { id: "8", title: "Wayne Sliwski Medico G", status: "in-progress", priority: "high", due: "2026-03-16", owner: "Brandon" },
  { id: "9", title: "Seminar bonus follow-up (Paul)", status: "backlog", priority: "low", due: "2026-03-20", owner: "Ryan" },
  { id: "10", title: "Lori Alberico HI quote", status: "done", priority: "medium", due: "2026-03-14", owner: "Ryan" },
  { id: "11", title: "Doug Gentile callback", status: "done", priority: "low", due: "2026-03-13", owner: "Terry" },
  { id: "12", title: "Bucki quote finalize", status: "in-progress", priority: "high", due: "2026-03-16", owner: "Ryan" },
  { id: "13", title: "Mojo project delivery", status: "in-progress", priority: "high", due: "2026-03-16", owner: "Ryan" },
  { id: "14", title: "DK Map refresh", status: "done", priority: "medium", due: "2026-03-13", owner: "Ryan" },
  { id: "15", title: "Kramer leads email", status: "backlog", priority: "medium", due: "2026-03-18", owner: "Ryan" },
];

export const inboxItems = [
  { id: "1", type: "email", from: "Caroline Nahm", subject: "Integrated Trust - Follow Up", time: "9:12 AM", read: false, snippet: "Hi Ryan, just wanted to follow up on our conversation about the integrated trust approach..." },
  { id: "2", type: "email", from: "Paul Seminar", subject: "Re: Bonus Structure", time: "8:45 AM", read: false, snippet: "Ryan, the bonus numbers look good. Can we schedule a call to finalize?" },
  { id: "3", type: "hatch", from: "Molly Clark", subject: "Hatch Message: Policy question", time: "8:30 AM", read: false, snippet: "Hi, I had a question about my current coverage and whether I need to update..." },
  { id: "4", type: "email", from: "Julie McGinnis", subject: "Studio Blue — March Schedule", time: "Yesterday", read: true, snippet: "Here's the updated schedule for March. Let me know if any changes needed." },
  { id: "5", type: "hatch", from: "Tom Richardson", subject: "Hatch Message: Quote request", time: "Yesterday", read: true, snippet: "Looking for a quote on home and auto bundle. Current carrier is State Farm." },
  { id: "6", type: "email", from: "Brandon Dailey", subject: "KRA Numbers Update", time: "Yesterday", read: true, snippet: "Hey Ryan, here are the latest KRA numbers for the team..." },
  { id: "7", type: "email", from: "Iris Fuchs", subject: "Meeting Friday - Agenda", time: "Mar 14", read: true, snippet: "Ryan, here's what I'd like to cover in our Friday meeting..." },
  { id: "8", type: "hatch", from: "Sandra Lee", subject: "Hatch Message: Renewal question", time: "Mar 14", read: true, snippet: "My policy is coming up for renewal next month. What are my options?" },
];

export const calendarEvents = [
  { id: "1", title: "Monday Kickoff", date: "2026-03-16", time: "8:00 AM", duration: 30, color: "blue" },
  { id: "2", title: "Team Huddle", date: "2026-03-16", time: "9:00 AM", duration: 30, color: "purple" },
  { id: "3", title: "Caroline Nahm Follow-up", date: "2026-03-16", time: "10:30 AM", duration: 30, color: "green" },
  { id: "4", title: "Mojo Project Review", date: "2026-03-16", time: "2:00 PM", duration: 60, color: "amber" },
  { id: "5", title: "Brandon 1:1", date: "2026-03-17", time: "9:00 AM", duration: 30, color: "purple" },
  { id: "6", title: "Medicare Webinar Prep", date: "2026-03-17", time: "11:00 AM", duration: 60, color: "blue" },
  { id: "7", title: "Production Meeting", date: "2026-03-18", time: "8:00 AM", duration: 60, color: "red" },
  { id: "8", title: "Iris Fuchs Meeting", date: "2026-03-20", time: "9:30 AM", duration: 60, color: "green" },
  { id: "9", title: "AGNT Mobile Onboarding", date: "2026-03-20", time: "10:00 AM", duration: 60, color: "cyan" },
  { id: "10", title: "Friday Board Call", date: "2026-03-20", time: "8:00 AM", duration: 60, color: "amber" },
  { id: "11", title: "Case Studies & Sales Training", date: "2026-03-20", time: "1:00 PM", duration: 90, color: "purple" },
];

export const kraAgents = [
  { name: "Ryan Dolph", role: "Branch Manager", submitted: 48, issued: 42, premium: 185400, rank: 1 },
  { name: "Brandon Dailey", role: "Senior Agent", submitted: 38, issued: 31, premium: 142000, rank: 2 },
  { name: "Terry Wilson", role: "Agent", submitted: 32, issued: 27, premium: 118500, rank: 3 },
  { name: "Jackie Martinez", role: "Agent", submitted: 28, issued: 22, premium: 95200, rank: 4 },
  { name: "Mike Chen", role: "Agent", submitted: 25, issued: 20, premium: 87600, rank: 5 },
  { name: "Sarah Thompson", role: "Agent", submitted: 22, issued: 18, premium: 78400, rank: 6 },
  { name: "David Park", role: "Agent", submitted: 20, issued: 16, premium: 72000, rank: 7 },
  { name: "Lisa Rodriguez", role: "Agent", submitted: 19, issued: 15, premium: 65800, rank: 8 },
  { name: "James Wright", role: "Agent", submitted: 18, issued: 14, premium: 61200, rank: 9 },
  { name: "Amanda Foster", role: "Jr. Agent", submitted: 15, issued: 11, premium: 48500, rank: 10 },
  { name: "Chris Nelson", role: "Jr. Agent", submitted: 14, issued: 10, premium: 44200, rank: 11 },
  { name: "Rachel Kim", role: "Jr. Agent", submitted: 12, issued: 9, premium: 38800, rank: 12 },
];

export const projects = [
  { id: "1", name: "Mission Control", desc: "Custom dashboard for life & business ops", progress: 15, status: "active", color: "blue" },
  { id: "2", name: "KRA Pipeline Automation", desc: "Automated agent performance tracking system", progress: 72, status: "active", color: "purple" },
  { id: "3", name: "Medicare 101 Webinar", desc: "Educational webinar series for clients", progress: 45, status: "active", color: "green" },
  { id: "4", name: "Mojo Project", desc: "Marketing deliverable — due March 16", progress: 88, status: "urgent", color: "amber" },
  { id: "5", name: "GHL CRM Migration", desc: "Full migration to GoHighLevel platform", progress: 60, status: "active", color: "cyan" },
  { id: "6", name: "Agent Onboarding System", desc: "Streamlined onboarding for new KRS agents", progress: 30, status: "active", color: "red" },
];

export const workflows = [
  { id: "1", name: "Gmail → Notion Inbox", desc: "Auto-creates tasks from incoming emails", status: "active", triggers: "New email", actions: 3 },
  { id: "2", name: "Hatch → Notion Inbox", desc: "Creates tasks from Hatch/GHL messages", status: "active", triggers: "Hatch message", actions: 2 },
  { id: "3", name: "KRA Pipeline Scraper", desc: "Scrapes agent production data daily", status: "error", triggers: "Daily 6 AM", actions: 5 },
  { id: "4", name: "Morning Briefing", desc: "Generates daily summary via OpenClaw", status: "active", triggers: "Daily 7 AM", actions: 4 },
  { id: "5", name: "Lead Assignment", desc: "Auto-assigns new leads to agents", status: "draft", triggers: "New GHL contact", actions: 3 },
  { id: "6", name: "Policy Renewal Reminder", desc: "Sends reminders 30 days before renewal", status: "active", triggers: "30 days pre-renewal", actions: 2 },
];

export const memories = [
  { date: "2026-03-16", entries: [
    "Monday kickoff — Mojo project due today, need to finalize and deliver",
    "Follow up on Dawn Shad UNL before noon",
    "KRA Pipeline had 2FA issue on March 8th — needs manual fix",
    "13 focus items in Notion, need to prioritize top 3",
  ]},
  { date: "2026-03-15", entries: [
    "Weekend planning — reviewed week ahead calendar",
    "Prepped for Monday meetings",
    "Noted: Iris Fuchs meeting moved to Friday 9:30 AM",
  ]},
  { date: "2026-03-14", entries: [
    "Completed DK Map refresh",
    "Lori Alberico HI quote sent",
    "Doug Gentile callback completed by Terry",
    "Reviewed agent production numbers — team trending up",
  ]},
  { date: "2026-03-13", entries: [
    "Refreshed DK Map ahead of Friday deadline",
    "Brandon sent KRA numbers update — looking solid",
    "Need to follow up on Proven IT copier",
  ]},
];

export const docs = [
  { id: "1", title: "KRS Agent Handbook", category: "Operations", updated: "2026-03-10", icon: "📘" },
  { id: "2", title: "GHL CRM Setup Guide", category: "Tech", updated: "2026-03-08", icon: "⚙️" },
  { id: "3", title: "Medicare 101 Script", category: "Sales", updated: "2026-03-12", icon: "📋" },
  { id: "4", title: "Commission Structure 2026", category: "Finance", updated: "2026-02-28", icon: "💰" },
  { id: "5", title: "Brand Guidelines", category: "Marketing", updated: "2026-01-15", icon: "🎨" },
  { id: "6", title: "Onboarding Checklist", category: "HR", updated: "2026-03-01", icon: "✅" },
  { id: "7", title: "Compliance Requirements", category: "Legal", updated: "2026-02-20", icon: "⚖️" },
  { id: "8", title: "Weekly Meeting Agenda Template", category: "Operations", updated: "2026-03-14", icon: "📝" },
  { id: "9", title: "Lead Gen Playbook", category: "Sales", updated: "2026-03-05", icon: "🎯" },
  { id: "10", title: "API Integration Notes", category: "Tech", updated: "2026-03-11", icon: "🔌" },
];

export const team = [
  { name: "Ryan Dolph", role: "Branch Manager", email: "rdolph@krs.insure", avatar: "RD", status: "active" },
  { name: "Brandon Dailey", role: "Senior Agent", email: "bdailey@krs.insure", avatar: "BD", status: "active" },
  { name: "Terry Wilson", role: "Agent", email: "twilson@krs.insure", avatar: "TW", status: "active" },
  { name: "Jackie Martinez", role: "Agent", email: "jmartinez@krs.insure", avatar: "JM", status: "active" },
  { name: "Julie McGinnis", role: "Marketing", email: "studiobluebyjulie@gmail.com", avatar: "JMG", status: "active" },
  { name: "Mike Chen", role: "Agent", email: "mchen@krs.insure", avatar: "MC", status: "active" },
  { name: "Sarah Thompson", role: "Agent", email: "sthompson@krs.insure", avatar: "ST", status: "active" },
  { name: "David Park", role: "Agent", email: "dpark@krs.insure", avatar: "DP", status: "active" },
  { name: "Lisa Rodriguez", role: "Agent", email: "lrodriguez@krs.insure", avatar: "LR", status: "active" },
  { name: "James Wright", role: "Agent", email: "jwright@krs.insure", avatar: "JW", status: "active" },
  { name: "Amanda Foster", role: "Jr. Agent", email: "afoster@krs.insure", avatar: "AF", status: "active" },
  { name: "Chris Nelson", role: "Jr. Agent", email: "cnelson@krs.insure", avatar: "CN", status: "active" },
  { name: "Rachel Kim", role: "Jr. Agent", email: "rkim@krs.insure", avatar: "RK", status: "active" },
];
