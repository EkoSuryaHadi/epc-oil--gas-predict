"use client";
import AppNav from "@/components/AppNav";
import KPICard from "@/components/dashboard/KPICard";
import PredictiveAnalytics from "@/components/dashboard/PredictiveAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function Home() {
  const kpis = [
    { title: "Project Progress", value: "62%", description: "Overall EPC portfolio", progress: 62 },
    { title: "Budget Utilization", value: "58%", description: "Spent vs. approved", progress: 58 },
    { title: "Schedule Adherence", value: "-3.2%", description: "SPI variance", progress: 68 },
    { title: "Risk Exposure", value: "Medium", description: "5 high risks open" },
  ];

  const topRisks = [
    { name: "Supply Chain Delays", owner: "Procurement", rating: 62 },
    { name: "Weather Interruptions", owner: "Construction", rating: 48 },
    { name: "Contractor Performance", owner: "PMO", rating: 54 },
  ];

  const featuredProjects = [
    { id: 1, name: "Gas Processing Train 4", completion: 52 },
    { id: 2, name: "Offshore Platform Delta", completion: 68 },
    { id: 3, name: "Crude Pipeline EPC", completion: 44 },
  ];

  return (
    <div>
      <AppNav />
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">EPC Project Control Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Oil & Gas portfolio overview with predictive insights</p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KPICard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              description={kpi.description}
              progress={kpi.progress}
            />
          ))}
        </section>

        <section>
          <PredictiveAnalytics />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Risks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topRisks.map((r) => (
                <div key={r.name} className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground">Owner: {r.owner}</div>
                  </div>
                  <div className="w-32 sm:w-48">
                    <Progress value={r.rating} />
                  </div>
                  <div className="text-xs w-12 text-right tabular-nums">{r.rating}%</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredProjects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="block">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="flex items-center gap-3 w-56">
                      <Progress value={p.completion} />
                      <span className="text-xs text-muted-foreground w-10 text-right">{p.completion}%</span>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="text-sm">
                <Link href="/projects" className="underline">View all projects →</Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
