"use client";
import { useMemo } from "react";
import AppNav from "@/components/AppNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import GanttChart, { GanttTask } from "@/components/gantt/GanttChart";
import PredictiveAnalytics from "@/components/dashboard/PredictiveAnalytics";
import Link from "next/link";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const PROJECTS = [
  { id: 1, name: "Gas Processing Train 4", budget: 420, spent: 210, completion: 52 },
  { id: 2, name: "Offshore Platform Delta", budget: 780, spent: 520, completion: 68 },
  { id: 3, name: "Crude Pipeline EPC", budget: 300, spent: 190, completion: 44 },
  { id: 4, name: "Refinery Upgrade Phase II", budget: 950, spent: 430, completion: 24 },
];

const formatMillionsUSD = (n: number) => `$${n.toLocaleString()}M`;
const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const fiscalMonths = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"] as const;

function buildProjectSCurve(completionPct: number) {
  // Typical planned cumulative profile (Apr–Mar)
  const planned = [4,9,15,22,30,40,52,65,77,87,95,100];
  // Actual follows planned with slight lag and capped by overall completion
  const actual = planned.map((p) => clamp(Math.min(p - 2, (p / 100) * completionPct)));
  // Ensure last point reflects completion (not exceeding planned)
  actual[11] = clamp(Math.min(planned[11], completionPct));
  return fiscalMonths.map((m, i) => ({ month: m, planned: planned[i], actual: actual[i] }));
}

function buildTasks(seed: number): GanttTask[] {
  const now = new Date("2025-01-01");
  const add = (d: number) => new Date(now.getTime() + d * 24 * 3600 * 1000);
  return [
    { id: "1", name: "FEED", start: add(0 + seed), end: add(30 + seed), progress: 100 },
    { id: "2", name: "Detail Design", start: add(35 + seed), end: add(120 + seed), progress: 85 },
    { id: "3", name: "Procurement", start: add(60 + seed), end: add(220 + seed), progress: 60 },
    { id: "4", name: "Fabrication", start: add(150 + seed), end: add(300 + seed), progress: 40 },
    { id: "5", name: "Construction", start: add(220 + seed), end: add(420 + seed), progress: 30 },
    { id: "6", name: "Commissioning", start: add(400 + seed), end: add(480 + seed), progress: 10 },
  ];
}

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  const project = PROJECTS.find((p) => p.id === idNum) ?? PROJECTS[0];
  const util = Math.round((project.spent / project.budget) * 100);
  const tasks = useMemo(() => buildTasks(idNum), [idNum]);
  const sCurve = useMemo(() => buildProjectSCurve(project.completion), [project.completion]);
  const eng = clamp(project.completion * 1.2);
  const proc = clamp((project.completion - 20) * 1.1);
  const cons = clamp((project.completion - 40) * 1.05);

  const resources = [
    { role: "Engineering", allocation: 72, fte: 48 },
    { role: "Procurement", allocation: 58, fte: 22 },
    { role: "Construction", allocation: 64, fte: 120 },
    { role: "QC / HSE", allocation: 45, fte: 18 },
  ];

  const milestones = [
    { name: "IFC Issued", date: "2025-06-30", status: "Done" },
    { name: "Long Lead PO", date: "2025-09-15", status: "On Track" },
    { name: "Mechanical Completion", date: "2026-03-10", status: "At Risk" },
  ];

  const discipline = { civ: 35, mech: 45, ein: 20 };
  const capexPct = 92;
  const opexPct = 8;

  return (
    <div>
      <AppNav />
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Project ID: {idNum}</p>
          </div>
          <Link href="/projects" className="text-sm underline">Back to Projects</Link>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Completion</CardTitle>
              <CardDescription>Overall progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{project.completion}%</div>
              <div className="mt-4">
                <Progress value={project.completion} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Budget Utilization</CardTitle>
              <CardDescription>Spent vs. Budget (USD M)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{util}%</div>
              <div className="text-sm text-muted-foreground">{formatMillionsUSD(project.spent)} / {formatMillionsUSD(project.budget)}</div>
              <div className="mt-4">
                <Progress value={util} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Schedule Adherence</CardTitle>
              <CardDescription>SPI variance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">-3.2%</div>
              <div className="mt-4">
                <Progress value={66} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Risk Exposure</CardTitle>
              <CardDescription>Open high risks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">5</div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Project S-Curve</CardTitle>
                <CardDescription>Fiscal Apr–Mar • Planned vs Actual (cumulative %)</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ planned: { label: "Planned", color: "hsl(var(--chart-1))" }, actual: { label: "Actual", color: "hsl(var(--chart-3))" } }}
                  className="h-64 w-full"
                >
                  <LineChart data={sCurve} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="planned" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>E/P/C Phase Breakdown</CardTitle>
                <CardDescription>Derived from overall completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm"><span>Engineering</span><span className="text-muted-foreground">{Math.round(eng)}%</span></div>
                  <Progress value={eng} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm"><span>Procurement</span><span className="text-muted-foreground">{Math.round(proc)}%</span></div>
                  <Progress value={proc} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm"><span>Construction</span><span className="text-muted-foreground">{Math.round(cons)}%</span></div>
                  <Progress value={cons} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discipline Split</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span>Civil</span><span className="text-muted-foreground">{discipline.civ}%</span></div>
                <Progress value={discipline.civ} />
                <div className="flex items-center justify-between text-sm"><span>Mechanical</span><span className="text-muted-foreground">{discipline.mech}%</span></div>
                <Progress value={discipline.mech} />
                <div className="flex items-center justify-between text-sm"><span>E&I</span><span className="text-muted-foreground">{discipline.ein}%</span></div>
                <Progress value={discipline.ein} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Categories</CardTitle>
                <CardDescription>Of total budget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>CAPEX</span>
                  <span className="text-muted-foreground">{capexPct}% • {formatMillionsUSD(Math.round(project.budget * (capexPct/100)))}</span>
                </div>
                <Progress value={capexPct} />
                <div className="flex items-center justify-between text-sm">
                  <span>OPEX</span>
                  <span className="text-muted-foreground">{opexPct}% • {formatMillionsUSD(Math.round(project.budget * (opexPct/100)))}</span>
                </div>
                <Progress value={opexPct} />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Gantt Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <GanttChart tasks={tasks} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {milestones.map((m) => (
                  <div key={m.name} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString()}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md border">{m.status}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources.map((r) => (
                  <div key={r.role} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{r.role}</span>
                      <span className="text-muted-foreground">{r.fte} FTE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1"><Progress value={r.allocation} /></div>
                      <span className="text-xs w-10 text-right">{r.allocation}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Predictive Analytics</CardTitle>
              <CardDescription>Cost, schedule and risk outlook</CardDescription>
            </CardHeader>
            <CardContent>
              <PredictiveAnalytics />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}