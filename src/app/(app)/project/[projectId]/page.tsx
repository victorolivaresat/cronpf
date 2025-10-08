
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { onValue, ref, update, push, set, remove, get, query, orderByChild, equalTo } from "firebase/database";
import { db } from "@/lib/firebase";
import { Project, Task, UserProfile } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListTodo, BarChartHorizontalBig, Plus, Pencil, Users, FileBarChart } from "lucide-react";
import ProjectLoading from "./loading";
import { ProjectHeader } from "@/components/project/project-header";
import { TaskList } from "@/components/project/task-list";
import { GanttChart } from "@/components/project/gantt-chart/gantt-chart";
// Eliminado import de AiInsightsButton por eliminación de AI insights
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/project/task-form";
import { EditProjectForm } from "@/components/project/edit-project-form";
import { ProjectReports } from "@/components/project/project-reports";
import { useParams, useRouter } from "next/navigation";
import { ManageMembersForm } from "@/components/project/manage-members-form";
import { useToast } from "@/hooks/use-toast";

export default function ProjectPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isEditProjectFormOpen, setIsEditProjectFormOpen] = useState(false);
  const [isMembersFormOpen, setIsMembersFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");

  useEffect(() => {
    if (!user || !projectId) {
      setLoading(false);
      return;
    };

    const projectRef = ref(db, `projects/${projectId}`);
    
    const unsubscribe = onValue(projectRef, async (snapshot) => {
      if (snapshot.exists()) {
        const projectData = snapshot.val();
        // Ensure user is a member
        if (projectData.members && projectData.members[user.uid]) {
           const tasks = projectData.tasks ? Object.fromEntries(Object.entries(projectData.tasks).map(([id, task]) => [id, {...task as object, id}])) : {};
           setProject({ id: snapshot.key!, ...projectData, tasks });
        } else {
          console.error("El usuario no es miembro de este proyecto.");
          router.push('/dashboard');
        }
      } else {
        console.error("Proyecto no encontrado en la base de datos.");
        router.push('/dashboard');
      }
      setLoading(false);
    }, (error) => {
      console.error("Falló la lectura de Firebase: " + error.message);
      setProject(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, projectId, router]);

  const handleUpdateProject = async (projectData: Omit<Project, 'id' | 'members' | 'ownerId' | 'tasks'>) => {
    if (!user || !project) return;
    
    const projectRef = ref(db, `projects/${project.id}`);
    await update(projectRef, projectData);

    setIsEditProjectFormOpen(false);
  };
  
  const handleTaskAction = async (taskData: Omit<Task, 'id' | 'subtasks'>, taskId?: string) => {
    if (!user || !project) return;
    
    if (taskId) { // Editing
      const taskPath = `projects/${project.id}/tasks/${taskId}`;
      await update(ref(db, taskPath), taskData);
    } else { // Creating
      const tasksPath = `projects/${project.id}/tasks`;
      const newTaskRef = push(ref(db, tasksPath));
      await set(newTaskRef, taskData);
    }
    setIsTaskFormOpen(false);
    setEditingTask(null);
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !project) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
        const taskPath = `projects/${project.id}/tasks/${taskId}`;
        await remove(ref(db, taskPath));
    }
  }

  const handleAddMember = async (email: string) => {
    if (!project) return false;

    // 1. Find user by email
    const usersRef = ref(db, 'users');
    const q = query(usersRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(q);

    if (!snapshot.exists()) {
        toast({ title: "Usuario no encontrado", description: `No existe ningún usuario con el correo ${email} en el sistema.`, variant: "destructive"});
        return false;
    }

    // 2. Get user data
    const foundUser = snapshot.val();
    const userId = Object.keys(foundUser)[0];
    const userProfile = foundUser[userId] as UserProfile;
    
    // 3. Check if already a member
    if (project.members[userId]) {
       toast({ title: "El usuario ya es miembro", description: `${email} ya forma parte de este proyecto.`, variant: "destructive"});
       return false;
    }

    // 4. Add member to project and project to user
    const updates: { [key: string]: any } = {};
    updates[`/projects/${project.id}/members/${userId}`] = { email: userProfile.email, role: 'member', name: userProfile.name };
    updates[`/users/${userId}/projectIds/${project.id}`] = true;

    await update(ref(db), updates);
    toast({ title: "Miembro agregado", description: `${email} ha sido añadido al proyecto.`});
    return true;
  }

  const handleRemoveMember = async (userIdToRemove: string) => {
    if (!project || userIdToRemove === project.ownerId) {
        toast({ title: "No se puede eliminar al propietario", description: "El propietario del proyecto no puede ser eliminado.", variant: "destructive"});
        return;
    };
    if (window.confirm("¿Estás seguro de que quieres eliminar a este miembro?")) {
        const updates: { [key: string]: null } = {};
        updates[`/projects/${project.id}/members/${userIdToRemove}`] = null;
        updates[`/users/${userIdToRemove}/projectIds/${project.id}`] = null;
        
        await update(ref(db), updates);
        toast({ title: "Miembro eliminado", description: `El usuario ha sido eliminado del proyecto.`});
    }
  }

  const openNewTaskForm = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  }
  
  const openEditTaskForm = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  }

  const handleShowReports = () => {
    setActiveTab("reports");
  }

  if (loading) {
    return <ProjectLoading />;
  }

  if (!project) {
    // This state is briefly hit before redirect. A more robust solution might use a dedicated "Not Found" page.
    return <div className="container py-8 text-center"><h2>Cargando Proyecto...</h2></div>;
  }

  const tasks = project.tasks ? Object.entries(project.tasks).map(([id, task]) => ({ ...task, id })) : [];
  const isOwner = user?.uid === project.ownerId;

  return (
    <div className="container py-8">
      <ProjectHeader project={project}>
        <div className="flex items-center gap-2">
            {isOwner && (
              <>
                 <Dialog open={isMembersFormOpen} onOpenChange={setIsMembersFormOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Gestionar Miembros
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-headline">Gestionar Miembros del Proyecto</DialogTitle>
                        </DialogHeader>
                        <ManageMembersForm
                            members={project.members}
                            onAddMember={handleAddMember}
                            onRemoveMember={handleRemoveMember}
                        />
                    </DialogContent>
                </Dialog>
                <Dialog open={isEditProjectFormOpen} onOpenChange={setIsEditProjectFormOpen}>
                  <DialogTrigger asChild>
                      <Button variant="outline">
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar Proyecto
                      </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle className="font-headline">Editar Proyecto</DialogTitle>
                      </DialogHeader>
                      <EditProjectForm
                          project={project}
                          onSubmit={handleUpdateProject}
                      />
                  </DialogContent>
              </Dialog>
            </>
            )}
        </div>
      </ProjectHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="tasks"><ListTodo className="w-4 h-4 mr-2" />Tareas</TabsTrigger>
            <TabsTrigger value="gantt"><BarChartHorizontalBig className="w-4 h-4 mr-2" />Gantt</TabsTrigger>
            <TabsTrigger value="reports"><FileBarChart className="w-4 h-4 mr-2" />Reportes</TabsTrigger>
          </TabsList>
          <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewTaskForm}>
                <Plus className="w-4 h-4 mr-2" /> Añadir Tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-headline">
                  {editingTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}
                </DialogTitle>
              </DialogHeader>
              <TaskForm 
                onSubmit={handleTaskAction} 
                project={project}
                task={editingTask} 
              />
            </DialogContent>
          </Dialog>
        </div>
        <TabsContent value="tasks">
          <TaskList 
            tasks={tasks} 
            onEditTask={openEditTaskForm} 
            onDeleteTask={handleDeleteTask}
            projectId={project.id}
            onShowReports={handleShowReports}
          />
        </TabsContent>
        <TabsContent value="gantt">
          <GanttChart project={project} tasks={tasks} />
        </TabsContent>
        <TabsContent value="reports">
          <ProjectReports project={project} tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
