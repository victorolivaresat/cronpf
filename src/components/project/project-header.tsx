
import { Project } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "lucide-react";

type ProjectHeaderProps = {
  project: Project;
  children?: React.ReactNode;
};

export function ProjectHeader({ project, children }: ProjectHeaderProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="font-headline text-4xl font-bold">{project.title}</h1>
        </div>
        <div className="flex items-center gap-2">
            {children}
        </div>
      </div>
      <p className="mt-2 text-muted-foreground max-w-2xl">{project.description}</p>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>
          {format(new Date(project.startDate), "d MMM, yyyy", { locale: es })} -{" "}
          {format(new Date(project.endDate), "d MMM, yyyy", { locale: es })}
        </span>
      </div>
    </div>
  );
}
