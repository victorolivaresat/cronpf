
import { ref, set, update, push } from "firebase/database";
import { db } from "./firebase";
import { Project } from "./types";

const projectsData = [
    {
      title: "TS - Teleservicios",
      startDate: "2024-10-01T00:00:00.000Z",
      endDate: "2024-10-30T00:00:00.000Z",
      description: "Migrar plataforma a la nube y hacerla funcional. Adaptar el código actual al entorno dockerizado existente.",
      tasks: {},
      progress: 0,
    },
    {
      title: "CCTV - Plataforma",
      startDate: "2024-10-01T00:00:00.000Z",
      endDate: "2024-10-30T00:00:00.000Z",
      description: "Migrar plataforma CCTV a la nube y hacerla funcional. Adaptar al código dockerizado ya existente.",
      tasks: {},
      progress: 0,
    },
    {
        title: "Migración Base de Datos",
        startDate: "2024-10-01T00:00:00.000Z",
        endDate: "2024-10-20T00:00:00.000Z",
        description: "Migrar base de datos de SQL Server a PostgreSQL con toda la data necesaria para el funcionamiento de las plataformas CCTV y TS.",
        tasks: {},
        progress: 0,
    },
    {
        title: "Migración Bots Scraping",
        startDate: "2024-10-01T00:00:00.000Z",
        endDate: "2024-10-25T00:00:00.000Z",
        description: "Migrar bots del servidor 192.168.21.35 al 192.168.21.41. Configurar para alimentar PostgreSQL en lugar de SQL Server.",
        tasks: {},
        progress: 0,
    },
    {
        title: "Conciliaciones de Recaudadores",
        startDate: "2024-10-01T00:00:00.000Z",
        endDate: "2024-10-15T00:00:00.000Z",
        description: "Completar validación de conciliación mensual (85% avanzado). Analizar y conciliar venta bruta entre Calimaco y recaudadores.",
        tasks: {},
        progress: 85,
    },
    {
        title: "Conciliación de Liquidaciones",
        startDate: "2024-10-01T00:00:00.000Z",
        endDate: "2024-11-30T00:00:00.000Z",
        description: "Validar que los depósitos del recaudador coincidan con lo calculado en conciliaciones. Aplicar reglas y porcentajes de descuento por recaudador.",
        tasks: {},
        progress: 0,
    },
    {
        title: "Plataforma Prevención de Fraude",
        startDate: "2024-10-01T00:00:00.000Z",
        endDate: "2024-12-15T00:00:00.000Z",
        description: "Desarrollo de plataforma para manejo de módulos de conciliaciones del área de Prevención de Fraude.",
        tasks: {},
        progress: 0,
    },
    {
        title: "Despliegue Plataforma",
        startDate: "2024-10-01T00:00:00.000Z",
        endDate: "2024-08-03T00:00:00.000Z",
        description: "Despliegue de Plataforma - PF",
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
