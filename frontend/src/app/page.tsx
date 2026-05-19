"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  BrainCircuit, 
  Search, 
  Target 
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] -z-10" />

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Rocket className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">InterviewPilot AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Features</a>
          <a href="#" className="hover:text-foreground transition-colors">How it Works</a>
          <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost">Login</Button>
          <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary">
            The Future of Interview Prep is Here
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
            Master Your Next <br />
            <span className="gradient-text">Technical Interview</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-12">
            InterviewPilot AI is your personalized career mentor. We research latest trends, 
            generate custom roadmaps, and simulate recruiter behavior to get you hired.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-2xl shadow-lg shadow-primary/20">
              Start Preparing Now
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-2xl border-white/10 glass">
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full">
          {[
            {
              icon: <Search className="w-6 h-6 text-purple-400" />,
              title: "Real-time Research",
              description: "AI scans GitHub, Reddit, and Blogs for the latest 2024 interview patterns."
            },
            {
              icon: <BrainCircuit className="w-6 h-6 text-indigo-400" />,
              title: "Adaptive Learning",
              description: "Questions that evolve with your performance. Never too easy, never too hard."
            },
            {
              icon: <Target className="w-6 h-6 text-blue-400" />,
              title: "Role Specific",
              description: "Whether it's Flutter, AI, or System Design, get specialized preparation."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card className="p-8 text-left glass border-white/5 hover:border-primary/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
