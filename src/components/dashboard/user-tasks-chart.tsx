
"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

type UserTasksChartProps = {
  tasks: Task[];
  userMap: Record<string, string>; // email -> name
};

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

  const chartConfig = {
    pending: {
      label: "Pendiente",
      color: "hsl(var(--chart-1))",
    },
    "in-progress": {
      label: "En Progreso",
      color: "hsl(var(--chart-2))",
    },
    completed: {
      label: "Completado",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

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
                fontSize={12}
                angle={-15}
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
              <Legend />
              <Bar dataKey="pending" stackId="a" fill={chartConfig.pending.color} radius={[0, 0, 0, 0]} />
              <Bar dataKey="in-progress" stackId="a" fill={chartConfig['in-progress'].color} />
              <Bar dataKey="completed" stackId="a" fill={chartConfig.completed.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
