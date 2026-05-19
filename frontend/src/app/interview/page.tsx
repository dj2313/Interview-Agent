"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Mic,
  Video,
  AlertCircle,
  BrainCircuit,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InterviewRoom() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello Alex! I'm Sarah, your AI interviewer for today. Ready to start our Technical Interview for the Senior Frontend role?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "That's a great start. Can you tell me more about how you'd optimize a React application with heavy data visualization?"
      }]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-8 py-4 border-b border-white/5 flex items-center justify-between glass z-10">
        <div className="flex items-center gap-4">
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1.5 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Live Interview
          </Badge>
          <div className="h-4 w-px bg-white/10" />
          <h2 className="font-semibold">Senior Frontend Developer Role</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon"><Mic className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon"><Video className="w-5 h-5" /></Button>
          <Button variant="destructive" size="sm">End Session</Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <ScrollArea className="flex-1 p-8">
            <div className="max-w-3xl mx-auto space-y-8 pb-32">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className={`w-10 h-10 border border-white/10 ${msg.role === "assistant" ? "bg-primary" : "bg-white/5"}`}>
                      <AvatarFallback>
                        {msg.role === "assistant" ? <BrainCircuit className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "glass border-white/10 text-foreground"
                        }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">
                        {msg.role === "assistant" ? "AI Interviewer" : "You"}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4"
                  >
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

          {/* Input Area */}
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
                />
                <Button
                  size="icon"
                  className="w-12 h-12 rounded-xl shadow-lg shadow-primary/20"
                  onClick={handleSend}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
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
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-muted-foreground leading-relaxed">
                {tip}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
