"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { profiles, roadmaps, interviews } from "@/lib/api";
import { 
  CheckCircle2, Circle, Clock, LayoutDashboard, 
  MessageSquare, Target, Settings 
} from "lucide-react";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: profiles.get, enabled: !!user });
  const { data: roadmapList } = useQuery({ queryKey: ["roadmaps"], queryFn: roadmaps.list, enabled: !!user });
  const { data: interviewList } = useQuery({ queryKey: ["interviews"], queryFn: interviews.list, enabled: !!user });

  if (loading) return null;

  const roadmapItems = roadmapList?.[0]?.items || [];
  const lastScore = interviewList?.length > 0 ? interviewList[0].score : null;
  const avgScore = interviewList?.length
    ? Math.round(interviewList.reduce((s: number, i: any) => s + (i.score || 0), 0) / interviewList.length)
    : null;

  return (
    <div className="flex h-screen bg-background">
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
        <div className="mt-auto space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5 text-muted-foreground">
            <Settings className="w-4 h-4" /> Settings
          </Button>
          <Button variant="ghost" onClick={logout} className="w-full justify-start gap-3 hover:bg-red-500/10 text-red-400">
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {user?.full_name || user?.email}</h1>
            <p className="text-muted-foreground">
              {profile?.target_role
                ? `Preparing for ${profile.target_role}`
                : "Complete onboarding to get started"}
            </p>
          </div>
          <Button className="gap-2" onClick={() => router.push("/interview")}>
            <Target className="w-4 h-4" /> New Mock Interview
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 glass border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Preparation Roadmap</h2>
                {roadmapItems.length > 0 && (
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                    {roadmapItems.length} Steps
                  </Badge>
                )}
              </div>
              {roadmapItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">No roadmap yet. Create one to start preparing.</p>
              ) : (
                <div className="space-y-4">
                  {roadmapItems.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/10">
                      <div className="mt-1">
                        {item.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                         item.status === "in-progress" ? <Clock className="w-5 h-5 text-primary" /> :
                         <Circle className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{item.title || item.topic}</h4>
                          {item.day && <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">Day {item.day}</Badge>}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{item.description || item.topic}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-8 glass border-white/5">
              <h3 className="font-bold mb-6">Performance Stats</h3>
              <div className="space-y-6">
                {avgScore !== null ? (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Average Score</span>
                      <span className="font-bold">{avgScore}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${avgScore}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Complete an interview to see scores.</p>
                )}
                {lastScore !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Last Interview</span>
                      <span className="font-bold">{lastScore}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${lastScore}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {profile?.target_companies?.length > 0 && (
              <Card className="p-8 glass border-white/5 bg-primary/10 border-primary/20">
                <h3 className="font-bold mb-3">Target Companies</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.target_companies.map((c: string) => (
                    <Badge key={c} className="bg-white/5">{c}</Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
