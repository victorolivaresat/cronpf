# **App Name**: ProjectFlow

## Core Features:

- Authentication: Implement user authentication using Firebase Authentication (email/password). Secure internal routes.
- Project Management: Allow users to create, edit, and delete projects with titles, descriptions, start/end dates, and a list of main tasks.
- Task & Subtask Management: Enable users to add, edit, delete, and mark tasks and subtasks as complete.  Tasks include name, description, status, start/end dates and subtasks include name and status. Display a progress counter (% completed based on subtasks).
- Gantt Chart View: Display project tasks in a Gantt chart view, visualizing task durations over time. Allow users to drag and adjust task durations from the chart, saving changes to Firebase in real-time.
- Real-time Data Sync: Utilize Firebase Realtime Database for real-time updates and automatic saving of changes to tasks and dates.
- Dark Mode Support: Implement a dark mode toggle for improved user experience in low-light conditions.
- AI Project Insight Tool: Leverage a Large Language Model (LLM) to analyze the project's description and existing tasks, and tool propose additional tasks or highlight potential timeline conflicts to improve project planning.  This functionality serves as a helpful assistant tool during project creation and refinement.

## Style Guidelines:

- Primary color: Slate Blue (#7378C5), a calming and professional color suggesting reliability and innovation. This color works effectively for the focus areas and main interaction points.
- Background color: Light Gray (#F5F7FA), offering a clean and unobtrusive backdrop that makes the components pop without causing distractions, aligning with the design goals of a work management application.
- Accent color: Pale Violet (#D8B4F8), carefully chosen from the analogous spectrum. Used for secondary actions and highlights, this provides gentle contrast without overpowering the primary elements, creating visual harmony.
- Headline font: 'Space Grotesk', sans-serif.
- Body font: 'Inter', sans-serif.
- Use a set of consistent and minimalist icons from Shadcn UI to represent different tasks, statuses, and actions. Icons should be easily recognizable and contribute to the clean design.
- Employ a responsive, grid-based layout with clear sections for projects, tasks, and the Gantt chart. Prioritize readability and ease of navigation.
- Incorporate subtle transitions and animations using Framer Motion to enhance user experience. For example, use animations when opening task details, updating statuses, or navigating between views.