import { Skeleton } from "@/components/ui/skeleton";
import { ListTodo, BarChartHorizontalBig } from "lucide-react";

export default function ProjectLoading() {
  return (
    <div className="container py-8">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4 mt-8">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
