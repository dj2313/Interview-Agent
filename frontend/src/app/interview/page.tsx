"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { interviews as interviewsApi } from "@/lib/api";
import {
  Send, AlertCircle, BrainCircuit, User, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function InterviewRoomInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!user) return;
    (async () => {
      const type = params.get("type") || "technical";
      const company = params.get("company") || undefined;
      const res = await interviewsApi.start({ type, company });
      setInterviewId(res.id);
      setMessages([{ role: "assistant", content: res.transcript?.[0]?.content || "Let's begin the interview." }]);
    })();
  }, [user, loading]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking || !interviewId) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsThinking(true);
    try {
      const res = await interviewsApi.respond(interviewId, userMsg);
      setMessages(prev => [...prev, { role: "assistant", content: res.message }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    }
    setIsThinking(false);
  };

  const handleEnd = async () => {
    if (!interviewId) return;
    setIsThinking(true);
    try {
      const res = await interviewsApi.end(interviewId);
      setFeedback(res.feedback);
      setEnded(true);
    } catch {}
    setIsThinking(false);
  };

  if (loading) return null;

  if (ended && feedback) {
    const f = typeof feedback === "string" ? { summary: feedback } : feedback;
    return (
      <div className="h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-2xl w-full glass rounded-2xl p-10 border border-white/5 space-y-6">
          <h1 className="text-3xl font-bold">Interview Complete</h1>
          {f.score && (
            <div className="flex gap-4">
              {["score", "technical", "communication", "problem_solving"].map(k => f[k] !== undefined && (
                <div key={k} className="text-center">
                  <div className="text-3xl font-bold text-primary">{f[k]}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{k.replace("_", " ")}</div>
                </div>
              ))}
            </div>
          )}
          {f.summary && <p className="text-muted-foreground leading-relaxed">{f.summary}</p>}
          {f.strengths?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Strengths</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{f.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}
          {f.weaknesses?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Areas to Improve</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">{f.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul>
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            <Button variant="outline" onClick={() => router.push("/interview")}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      <header className="px-8 py-4 border-b border-white/5 flex items-center justify-between glass z-10">
        <div className="flex items-center gap-4">
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1.5 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Live Interview
          </Badge>
          <div className="h-4 w-px bg-white/10" />
          <h2 className="font-semibold">{params.get("type") || "Technical"} Interview</h2>
          {params.get("company") && <Badge variant="outline">{params.get("company")}</Badge>}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="destructive" size="sm" onClick={handleEnd} disabled={isThinking || ended}>
            {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            End Session
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col relative">
          <ScrollArea className="flex-1 p-8">
            <div className="max-w-3xl mx-auto space-y-8 pb-32">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className={`w-10 h-10 border border-white/10 ${msg.role === "assistant" ? "bg-primary" : "bg-white/5"}`}>
                      <AvatarFallback>{msg.role === "assistant" ? <BrainCircuit className="w-5 h-5" /> : <User className="w-5 h-5" />}</AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground" : "glass border-white/10 text-foreground"}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">
                        {msg.role === "assistant" ? "AI Interviewer" : "You"}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {isThinking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                    <Avatar className="w-10 h-10 border border-white/10 bg-primary">
                      <AvatarFallback><BrainCircuit className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                    <div className="glass border-white/10 p-4 rounded-2xl flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}
                <div ref={scrollRef} />
              </AnimatePresence>
            </div>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0a0f] to-transparent">
            <div className="max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition-opacity" />
              <div className="relative flex items-center gap-2 glass p-2 rounded-2xl border-white/10">
                <Input
                  className="bg-transparent border-0 focus-visible:ring-0 text-lg py-6"
                  placeholder="Type your response..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isThinking || ended}
                />
                <Button size="icon" className="w-12 h-12 rounded-xl shadow-lg shadow-primary/20" onClick={handleSend} disabled={isThinking || ended}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-80 border-l border-white/5 glass p-6 hidden lg:block">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" /> Interview Tips
          </h3>
          <div className="space-y-4">
            {[
              "Be specific about your contributions in projects.",
              "Use the STAR method for behavioral questions.",
              "Explain your thought process clearly.",
              "Don't be afraid to ask for clarification."
            ].map((tip, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-muted-foreground leading-relaxed">{tip}</div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function InterviewRoom() {
  return (
    <Suspense fallback={<div className="h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <InterviewRoomInner />
    </Suspense>
  );
}
