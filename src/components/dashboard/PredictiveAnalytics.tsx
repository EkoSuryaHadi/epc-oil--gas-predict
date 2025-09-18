"use client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const costData = months.map((m, i) => ({
  month: m,
  actual: Math.round(80 + i * 10 + Math.random() * 20),
  forecast: Math.round(85 + i * 11 + Math.random() * 25),
}));

const scheduleData = months.map((m, i) => ({
  month: m,
  planned: Math.min(100, Math.round(i * 9)),
  predicted: Math.min(100, Math.round(i * 9 + (Math.random() * 6 - 3))),
}));

const riskData = [
  { name: "Supply Chain", score: 62 },
  { name: "HSE", score: 35 },
  { name: "Weather", score: 48 },
  { name: "Contractor", score: 54 },
  { name: "Design", score: 28 },
];

export function PredictiveAnalytics() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="col-span-1">
        <h3 className="text-sm font-medium mb-2">Cost Forecast (USD M)</h3>
        <ChartContainer
          className="bg-card rounded-xl border p-4 h-64"
          config={{
            actual: { label: "Actual", color: "var(--chart-1)" },
            forecast: { label: "Forecast", color: "var(--chart-2)" },
          }}
        >
          <LineChart data={costData} margin={{ left: 6, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="forecast" stroke="var(--color-forecast)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>
      <div className="col-span-1">
        <h3 className="text-sm font-medium mb-2">Schedule Prediction (% Complete)</h3>
        <ChartContainer
          className="bg-card rounded-xl border p-4 h-64"
          config={{
            planned: { label: "Planned", color: "var(--chart-3)" },
            predicted: { label: "Predicted", color: "var(--chart-4)" },
          }}
        >
          <AreaChart data={scheduleData} margin={{ left: 6, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="planned" stroke="var(--color-planned)" fill="var(--color-planned)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="predicted" stroke="var(--color-predicted)" fill="var(--color-predicted)" fillOpacity={0.15} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-sm font-medium mb-2">Risk Assessment (Probability x Impact)</h3>
        <ChartContainer
          className="bg-card rounded-xl border p-4 h-64"
          config={{
            score: { label: "Risk Score", color: "var(--chart-5)" },
          }}
        >
          <BarChart data={riskData} margin={{ left: 6, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="score" fill="var(--color-score)" radius={[6,6,0,0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
export default PredictiveAnalytics;