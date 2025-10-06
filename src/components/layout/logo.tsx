import { GanttChartSquare } from "lucide-react";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <GanttChartSquare className="h-6 w-6 text-primary" />
      <span className="font-headline text-lg font-bold text-foreground">
        Cron PF
      </span>
    </Link>
  );
}
