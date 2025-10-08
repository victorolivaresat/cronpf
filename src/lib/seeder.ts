
import { ref, update, push } from "firebase/database";
import { db } from "./firebase";
import { Project } from "./types";

const projectsData = [
    {
      title: "Test Project Example",
      startDate: "2024-10-01T00:00:00.000Z",
      endDate: "2024-10-30T00:00:00.000Z",
      description: "Este es un proyecto de ejemplo para demostrar la funcionalidad de la aplicación.",
      tasks: {},
      progress: 0,
    }
];

export const seedDatabase = async (userId: string, userEmail: string, userName: string) => {
    const updates: { [key: string]: any } = {};
    const userProjectIds: { [key: string]: boolean } = {};
    const projectsRef = ref(db, 'projects');

    projectsData.forEach((proj) => {
        const newProjectRef = push(projectsRef);
        const projectId = newProjectRef.key;
        if(!projectId) return;

        const newProject: Omit<Project, 'id'> = {
            title: proj.title,
            description: proj.description,
            startDate: proj.startDate,
            endDate: proj.endDate,
            ownerId: userId,
            members: {
                [userId]: {
                    email: userEmail,
                    role: 'owner',
                    name: userName
                }
            },
            tasks: {}
        };
        updates[`/projects/${projectId}`] = newProject;
        userProjectIds[projectId] = true;
    });

    updates[`/users/${userId}/projectIds`] = userProjectIds;

    await update(ref(db), updates);
}
