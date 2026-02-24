"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import type { Role } from "@/data/roles";
import { departmentColors } from "@/data/roles";
import { useInterviewHistory, type ChatMessage } from "@/context/InterviewHistoryContext";

interface Message {
  role: "system" | "user" | "assistant";
  text: string;
}

function getDummyAnswer(role: Role, question: string): string {
  const q = question.toLowerCase();

  if (q.includes("core function") || q.includes("walk me through")) {
    const fns = role.functions.map((f) => f.name).join(", ");
    return `I operate across ${role.functionCount} core functions: ${fns}. Each function is designed to run autonomously with built-in exception handling. My primary focus is ${role.description.toLowerCase()} I can walk you through any specific function in detail — just ask.`;
  }

  if (q.includes("exception") || q.includes("approval")) {
    return `I follow a structured approval flow: AI suggestion → Human review gate → Approve/Edit/Reject → Execution → Audit event. High-risk actions always require human approval before execution. All decisions are logged with full audit trails for compliance. You maintain complete control over exception thresholds.`;
  }

  if (q.includes("first 30 days") || q.includes("improve")) {
    const outcomes = role.outcomes
      .map((o) => `${o.value} ${o.label}`)
      .join(", ");
    return `In the first 30 days, you can expect measurable improvements: ${outcomes}. Week 1 is onboarding and data mapping. Weeks 2-3 focus on automating high-volume repetitive tasks. By week 4, I'm running at full capacity with continuous optimization.`;
  }

  if (q.includes("integrate") || q.includes("erp") || q.includes("crm")) {
    return `I integrate natively with major enterprise platforms — SAP, Oracle, Salesforce, HubSpot, Xero, and QuickBooks. Integration uses secure API connectors with OAuth 2.0 authentication. Typical setup takes 2-4 days. I also support custom webhooks and middleware for legacy systems.`;
  }

  if (q.includes("cost") || q.includes("price") || q.includes("quote")) {
    return `Pricing depends on your workflow volume and integration complexity. As a Digital Colleague, I'm significantly more cost-effective than a full-time hire — typically 60-80% less. I'd recommend booking a free consultation where we can scope your specific needs and provide a tailored quote.`;
  }

  if (q.includes("security") || q.includes("data") || q.includes("compliance")) {
    return `Security is built into every layer. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). I operate within your existing access controls and never store sensitive data outside your environment. Full SOC 2 Type II compliance with detailed audit logging for every action taken.`;
  }

  if (q.includes("team") || q.includes("human") || q.includes("replace")) {
    return `I'm designed to augment your team, not replace them. I handle the repetitive, high-volume tasks so your people can focus on strategic work. Your team maintains oversight through approval gates and can override any of my actions. Think of me as a tireless colleague who handles the operational heavy lifting.`;
  }

  // Default answer
  return `Great question. As the ${role.title}, I specialize in ${role.description.toLowerCase()} My automation level averages ${Math.round(role.functions.reduce((sum, f) => sum + f.automationPercent, 0) / role.functions.length)}% across all functions. I'd be happy to dive deeper into any specific area — just let me know what matters most to your organization.`;
}

const quickPrompts = [
  "Walk me through your core functions.",
  "How do you handle exceptions and approvals?",
  "Show me what you improve in the first 30 days.",
  "How do you integrate with our ERP and CRM?",
];

export default function InterviewChat({ role }: { role: Role }) {
  const colors = departmentColors[role.department];
  const { getSession, initSession, saveMessage } = useInterviewHistory();
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const systemMsg = `Interview started for ${role.title}. Ask me about functions, controls, deployment, and outcomes.`;

  // Initialize session on mount
  useEffect(() => {
    initSession(role.id, systemMsg);
  }, [role.id, systemMsg, initSession]);

  const session = getSession(role.id);
  const messages: Message[] = session
    ? session.messages.map((m) => ({ role: m.role, text: m.text }))
    : [{ role: "system", text: systemMsg }];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const now = Date.now();
    const userMsg: ChatMessage = { role: "user", text: text.trim(), timestamp: now };
    const answer = getDummyAnswer(role, text);
    const assistantMsg: ChatMessage = { role: "assistant", text: answer, timestamp: now + 1 };

    saveMessage(role.id, userMsg);
    saveMessage(role.id, assistantMsg);
    setInput("");
  };

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
      {/* ── Left column: Chat (2/3) ── */}
      <div className="lg:col-span-2">
        {/* Chat area */}
        <div className="mt-6 bg-blue-50/60 border border-blue-100 rounded-xl p-5 min-h-[380px] max-h-[480px] overflow-y-auto flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-slate-800 text-white rounded-br-sm"
                    : msg.role === "system"
                      ? "bg-white border border-blue-200 text-slate-700"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Ask about controls, functions, rollout, or KPIs"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
          />
          <button
            onClick={() => sendMessage(input)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>

      {/* ── Right column: Sidebar (1/3) ── */}
      <div className="mt-8 lg:mt-0 space-y-6">
        {/* Quick prompts */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Quick Interview Prompts
          </h2>
          <div className="mt-4 space-y-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="w-full text-left border-2 border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 px-4 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Role info */}
        <p className="text-sm text-slate-500">
          Role hierarchy: Role → Functions → Skills
        </p>

        {/* Department tags */}
        <div className="flex flex-wrap gap-2">
          {role.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`text-xs font-medium px-3 py-1.5 rounded-full ${colors.text} ${colors.light}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Back link */}
        <Link
          href={`/roles/${role.id}`}
          className="w-full inline-flex items-center justify-center border-2 border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 px-4 py-3 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
        >
          Back to Role Detail
        </Link>
      </div>
    </div>
  );
}
