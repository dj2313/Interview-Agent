"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  LayoutDashboard, 
  MessageSquare, 
  Target, 
  Settings 
} from "lucide-react";

export default function Dashboard() {
  const roadmapItems = [
    {
      day: 1,
      title: "React Server Components Deep Dive",
      description: "Understand the architecture and benefits of RSC in Next.js 14.",
      priority: "High",
      status: "completed"
    },
    {
      day: 2,
      title: "Advanced Framer Motion",
      description: "Learn how to build complex layout animations and orchestrate transitions.",
      priority: "Medium",
      status: "in-progress"
    },
    {
      day: 3,
      title: "System Design: Scalable Chat App",
      description: "Design a real-time chat system using WebSockets and Redis.",
      priority: "High",
      status: "pending"
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 glass">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <CheckCircle2 className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight">InterviewPilot</span>
        </div>

        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-white/5">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5">
            <MessageSquare className="w-4 h-4" /> Mock Interviews
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5">
            <Target className="w-4 h-4" /> Roadmap
          </Button>
        </nav>

        <div className="mt-auto">
          <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5 text-muted-foreground">
            <Settings className="w-4 h-4" /> Settings
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Alex</h1>
            <p className="text-muted-foreground">You are 45% ready for your Senior Frontend Interview.</p>
          </div>
          <Button className="gap-2">
            <Target className="w-4 h-4" /> New Mock Interview
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Roadmap */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 glass border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Preparation Roadmap</h2>
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                  2 Weeks Remaining
                </Badge>
              </div>

              <div className="space-y-4">
                {roadmapItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/10">
                    <div className="mt-1">
                      {item.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : item.status === "in-progress" ? (
                        <Clock className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{item.title}</h4>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                          Day {item.day}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <Badge className="bg-white/5 hover:bg-white/10 text-xs">
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Stats & Quick Actions */}
          <div className="space-y-6">
            <Card className="p-8 glass border-white/5">
              <h3 className="font-bold mb-6">Performance Stats</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Technical Skill</span>
                    <span className="font-bold">78%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[78%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Communication</span>
                    <span className="font-bold">62%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[62%]" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 glass border-white/5 bg-primary/10 border-primary/20">
              <h3 className="font-bold mb-3">AI Insights</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                You excel at React architecture, but you might need more practice in 
                explaining System Design tradeoffs.
              </p>
              <Button variant="secondary" className="w-full">
                Practice System Design
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
