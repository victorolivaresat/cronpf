
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Dna } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { onValue, ref, get, remove, update, query, orderByChild, equalTo, push } from "firebase/database";
import { db, auth, reauthenticateWithCredential, EmailAuthProvider } from "@/lib/firebase";
import { Project, Task } from "@/lib/types";
import { ProjectCard } from "@/components/dashboard/project-card";
import { CreateProjectForm } from "@/components/dashboard/create-project-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { seedDatabase } from "@/lib/seeder";
import { useToast } from "@/hooks/use-toast";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { UserTasksChart } from "@/components/dashboard/user-tasks-chart";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { ActionConfirmationDialog } from "@/components/dashboard/action-confirmation-dialog";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [visibleProjects, setVisibleProjects] = useState(6);

  const PROJECTS_PER_PAGE = 6;

  const isAdmin = user?.email === 'victor.olivares@apuestatotal.com';

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const projectsRef = ref(db, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allProjects = snapshot.val();
        const userProjects = Object.entries(allProjects)
          .map(([id, project]) => ({ id, ...project as Omit<Project, 'id'> }))
          .filter(p => p.members && p.members[user.uid]);
        setProjects(userProjects);
      } else {
        setProjects([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const { allTasks, userMap } = useMemo(() => {
    const tasks: (Task & { projectName: string })[] = [];
    const users: Record<string, string> = {};

    projects.forEach(p => {
      const projectTasks = p.tasks ? Object.entries(p.tasks).map(([id, task]) => ({ id, ...task as Omit<Task, 'id'> })) : [];
      tasks.push(...projectTasks.map(t => ({ ...t, projectName: p.title })));

      if (p.members) {
        Object.values(p.members).forEach(member => {
          if (!users[member.email] && member.name) {
            users[member.email] = member.name;
          }
        });
      }
    });

    return { allTasks: tasks, userMap: users };
  }, [projects]);

  const displayedProjects = projects.slice(0, visibleProjects);
  const hasMoreProjects = projects.length > visibleProjects;

  const loadMoreProjects = () => {
    setVisibleProjects(prev => prev + PROJECTS_PER_PAGE);
  };


  const handleCreateProject = async (data: any) => {
    if (!user || !user.email) return;

    const newProjectRef = push(ref(db, 'projects'));
    const projectId = newProjectRef.key;
    if (!projectId) return;

    const { memberEmails, ...projectData } = data;
    const projectUpdates: { [key: string]: any } = {};
    const userUpdates: { [key: string]: any } = {};

    const members: Project['members'] = {
      [user.uid]: { email: user.email, role: 'owner', name: user.displayName || user.email }
    };
    userUpdates[`/users/${user.uid}/projectIds/${projectId}`] = true;

    if (memberEmails) {
      const emails = memberEmails.split(',').map((e: string) => e.trim()).filter((e: string) => e);
      for (const email of emails) {
        const usersRef = ref(db, 'users');
        const snapshot = await get(query(usersRef, orderByChild('email'), equalTo(email)));

        if (snapshot.exists()) {
          const foundUser = snapshot.val();
          const userId = Object.keys(foundUser)[0];
          const userData = foundUser[userId];
          if (!members[userId]) {
            members[userId] = { email, role: 'member', name: userData.name || email };
            userUpdates[`/users/${userId}/projectIds/${projectId}`] = true;
          }
        } else {
          toast({ title: `Usuario no encontrado: ${email}`, variant: "destructive" });
        }
      }
    }

    const newProject: Omit<Project, 'id'> = {
      ...projectData,
      ownerId: user.uid,
      members,
      tasks: {}
    };

    projectUpdates[`/projects/${projectId}`] = newProject;
    await update(ref(db), { ...projectUpdates, ...userUpdates });
    setIsDialogOpen(false);
    toast({ title: "¡Proyecto creado con éxito!" });
  };

  const handleSeedDatabase = async () => {
    if (!user) return;
    try {
      await seedDatabase(user.uid, user.email || '', user.displayName || '');
      toast({ title: "¡Datos de ejemplo cargados con éxito!" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error al cargar los datos de ejemplo.", variant: 'destructive' });
    }
  }

  const handleClearDatabase = async () => {
    if (!user) return;
    try {
      // Remove all projects
      await remove(ref(db, 'projects'));

      setProjects([]);
      toast({ title: "La base de datos ha sido limpiada." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error al limpiar la base de datos.", description: (e as Error).message, variant: 'destructive' });
    }
  }

  const handleAdminAction = async (action: 'seed' | 'clear', password?: string) => {
    if (!user || !user.email || !password) {
      toast({ title: "Acción cancelada", description: "Se requiere contraseña.", variant: 'destructive' });
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      if (auth.currentUser) {
        await reauthenticateWithCredential(auth.currentUser, credential);

        if (action === 'seed') {
          await handleSeedDatabase();
          setShowSeedDialog(false);
        } else if (action === 'clear') {
          await handleClearDatabase();
          setShowClearDialog(false);
        }
      }
    } catch (error) {
      toast({ title: "Error de autenticación", description: "Contraseña incorrecta. La acción fue cancelada.", variant: 'destructive' });
      console.error("Re-authentication failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-8 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
          </div>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-headline text-3xl font-bold">Panel de Control</h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <ActionConfirmationDialog
                open={showSeedDialog}
                onOpenChange={setShowSeedDialog}
                onConfirm={(password) => handleAdminAction('seed', password)}
                title="¿Cargar Datos de Ejemplo?"
                description="Esta acción llenará la base de datos con proyectos y tareas de ejemplo. Para confirmar, por favor ingresa tu contraseña."
                triggerButton={
                  <Button variant="outline"><Dna className="mr-2 h-4 w-4" /> Cargar Datos de Ejemplo</Button>
                }
              />
              <ActionConfirmationDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
                onConfirm={(password) => handleAdminAction('clear', password)}
                title="¿Limpiar la Base de Datos?"
                description="¡ADVERTENCIA! Esta acción eliminará permanentemente TODOS los proyectos y tareas. Para confirmar, por favor ingresa tu contraseña."
                variant="destructive"
                triggerButton={
                  <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Limpiar Datos</Button>
                }
              />
            </>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-headline">Crear un Nuevo Proyecto</DialogTitle>
              </DialogHeader>
              <CreateProjectForm onSubmit={handleCreateProject} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-8">
          <DashboardSummary projects={projects} tasks={allTasks} />

          <div className="grid gap-8 lg:grid-cols-2">
            <UserTasksChart tasks={allTasks} userMap={userMap} />
            <UpcomingTasks tasks={allTasks} />
          </div>

          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Tus Proyectos</h2>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {displayedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            
            {hasMoreProjects && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={loadMoreProjects}
                  className="px-8"
                >
                  Cargar más proyectos
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Aún no hay proyectos</h2>
          <p className="text-muted-foreground mb-4">
            Comienza creando tu primer proyecto o cargando algunos datos de ejemplo.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-headline">Crear un Nuevo Proyecto</DialogTitle>
              </DialogHeader>
              <CreateProjectForm onSubmit={handleCreateProject} />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
