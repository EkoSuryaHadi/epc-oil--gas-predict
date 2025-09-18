"use client";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const data = [
{ id: 1, name: "LNG Train 3 Expansion", status: "On Track", budget: 1200, spent: 610, start: "2024-11-15", end: "2027-06-30", completion: 55 },
{ id: 2, name: "Offshore Platform Delta", status: "At Risk", budget: 780, spent: 560, start: "2024-04-01", end: "2026-02-15", completion: 70 },
{ id: 3, name: "Subsea Tieback Aurora", status: "On Track", budget: 450, spent: 210, start: "2025-02-01", end: "2026-10-31", completion: 46 },
{ id: 4, name: "Crude Pipeline EPC", status: "Delayed", budget: 300, spent: 195, start: "2024-09-05", end: "2025-12-30", completion: 45 },
{ id: 5, name: "Refinery Upgrade Phase II", status: "On Track", budget: 950, spent: 440, start: "2025-03-01", end: "2027-01-30", completion: 25 },
{ id: 6, name: "Gas Processing Train 4", status: "On Track", budget: 420, spent: 225, start: "2025-01-10", end: "2026-08-20", completion: 54 },
{ id: 7, name: "Petchem PP Unit Revamp", status: "At Risk", budget: 1100, spent: 730, start: "2024-06-20", end: "2026-12-15", completion: 66 },
{ id: 8, name: "FPSO Conversion Orion", status: "Delayed", budget: 900, spent: 340, start: "2025-04-10", end: "2027-03-31", completion: 32 }];


const statuses = ["On Track", "At Risk", "Delayed"] as const;

// s-curve sample portfolio data (cumulative %) — Fiscal Apr–Mar
const sCurveData = [
{ month: "Apr", planned: 4, actual: 3 },
{ month: "May", planned: 9, actual: 8 },
{ month: "Jun", planned: 15, actual: 14 },
{ month: "Jul", planned: 22, actual: 20 },
{ month: "Aug", planned: 30, actual: 28 },
{ month: "Sep", planned: 40, actual: 38 },
{ month: "Oct", planned: 52, actual: 49 },
{ month: "Nov", planned: 65, actual: 61 },
{ month: "Dec", planned: 77, actual: 73 },
{ month: "Jan", planned: 87, actual: 84 },
{ month: "Feb", planned: 95, actual: 92 },
{ month: "Mar", planned: 100, actual: 98 }];


function StatusBadge({ s }: {s: typeof statuses[number];}) {
  const color = s === "On Track" ? "bg-green-500" : s === "At Risk" ? "bg-amber-500" : "bg-red-500";
  return <Badge className={`${color} text-white`}>{s}</Badge>;
}

// Helpers: formatting and auto risk flags
const formatMillionsUSD = (n: number) => `$${n.toLocaleString()}M`;

function clamp(v: number, min = 0, max = 100) {return Math.min(max, Math.max(min, v));}
function plannedCompletionToday(p: {start: string;end: string;}) {
  const now = new Date();
  const start = new Date(p.start).getTime();
  const end = new Date(p.end).getTime();
  const t = now.getTime();
  if (t <= start) return 0;
  if (t >= end) return 100;
  return clamp((t - start) / (end - start) * 100);
}
function derivedStatus(p: {spent: number;budget: number;completion: number;start: string;end: string;}): typeof statuses[number] {
  const util = p.budget > 0 ? p.spent / p.budget * 100 : 0;
  const costDelta = util - p.completion; // positive = overspend vs progress
  const plan = plannedCompletionToday(p);
  const schedDelta = plan - p.completion; // positive = behind schedule
  const worst = Math.max(costDelta, schedDelta);
  if (worst >= 20) return "Delayed";
  if (worst >= 10) return "At Risk";
  return "On Track";
}

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status ? p.status === status : true;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <div>
      <AppNav />
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input placeholder="Search projects..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <Select value={status ?? undefined} onValueChange={(v) => setStatus(v)}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Portfolio S-Curve */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Portfolio S-Curve (Planned vs Actual)</h3>
                <span className="text-xs text-muted-foreground">Fiscal Year: Apr–Mar • Cumulative %</span>
              </div>
              <ChartContainer
                config={{ planned: { label: "Planned", color: "hsl(var(--chart-1))" }, actual: { label: "Actual", color: "hsl(var(--chart-3))" } }}
                className="h-64 w-full rounded-md border bg-card p-2">

                <LineChart data={sCurveData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="planned" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Budget (USD, M)</TableHead>
                  <TableHead>Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const duration = `${new Date(p.start).toLocaleDateString()} - ${new Date(p.end).toLocaleDateString()}`;
                  const util = Math.round(p.spent / p.budget * 100);
                  const autoStatus = derivedStatus(p);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link href={`/projects/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                      </TableCell>
                      <TableCell><StatusBadge s={autoStatus as any} /></TableCell>
                      <TableCell>{duration}</TableCell>
                      <TableCell>
                        <div className="text-sm">{formatMillionsUSD(p.spent)} / {formatMillionsUSD(p.budget)} ({util}%)</div>
                        <Progress value={util} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm mb-1">{p.completion}%</div>
                        <Progress value={p.completion} />
                      </TableCell>
                    </TableRow>);

                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>);

}