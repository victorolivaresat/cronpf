
"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
// Componente de leyenda personalizada para traducir los labels
function CustomLegend({ payload }: { payload?: any[] }) {
  if (!payload) return null;
  return (
    <ul className="flex gap-4 mt-2 justify-center items-center w-full">
      {payload.map((entry) => {
        const key = entry.dataKey as keyof typeof chartConfig;
        return (
          <li key={entry.dataKey} className="flex items-center gap-1 text-xs text-slate-500">
            <span style={{ background: entry.color, width: 12, height: 12, display: 'inline-block', borderRadius: 2 }} />
            {chartConfig[key]?.label || entry.value}
          </li>
        );
      })}
    </ul>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";


type UserTasksChartProps = {
  tasks: Task[];
  userMap: Record<string, string>; // email -> name
};

// Config global para acceso desde leyenda
const chartConfig = {
  "pending": {
    label: "Pendiente",
    color: "hsl(var(--chart-1))",
  },
  "in-progress": {
    label: "En Progreso",
    color: "hsl(var(--chart-2))",
  },
  "completed": {
    label: "Completado",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function UserTasksChart({ tasks, userMap }: UserTasksChartProps) {
  const chartData = useMemo(() => {
    const tasksByAssignee: { [key: string]: { pending: number; 'in-progress': number; completed: number } } = {};

    tasks.forEach(task => {
      if (task.assignees && task.assignees.length > 0) {
        task.assignees.forEach(assigneeEmail => {
          if (!tasksByAssignee[assigneeEmail]) {
            tasksByAssignee[assigneeEmail] = { pending: 0, 'in-progress': 0, completed: 0 };
          }
          tasksByAssignee[assigneeEmail][task.status]++;
        });
      }
    });
    
    return Object.entries(tasksByAssignee).map(([email, statuses]) => ({
      name: userMap[email] || email.split('@')[0], // Show name, or fallback to email prefix
      ...statuses,
    }));
  }, [tasks, userMap]);

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Carga de Trabajo por Usuario</CardTitle>
                <CardDescription>Distribución de tareas asignadas a cada miembro del equipo.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No hay tareas asignadas para mostrar en el gráfico.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Carga de Trabajo por Usuario</CardTitle>
        <CardDescription>Distribución de tareas asignadas a cada miembro del equipo.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData} width={800} height={300} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={10}
                angle={0}
                textAnchor="end"
                height={50}
                interval={0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))'
                }}
              />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="pending" stackId="a" fill={chartConfig.pending.color} radius={[0, 0, 0, 0]} />
              <Bar dataKey="in-progress" stackId="a" fill={chartConfig['in-progress'].color} />
              <Bar dataKey="completed" stackId="a" fill={chartConfig.completed.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
