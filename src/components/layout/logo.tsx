import { GanttChartSquare } from "lucide-react";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <span className="font-headline text-lg font-bold text-foreground">
        Cron PF
      </span>
    </Link>
  );
}
