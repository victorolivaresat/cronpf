
export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  startDate: string; // ISO string
  endDate: string; // ISO string
  subtasks?: Record<string, Omit<Subtask, 'id'>>;
  assignees?: string[]; // user emails
}

export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  tasks?: Record<string, Omit<Task, 'id'>>;
  members: Record<string, { email: string; role: 'owner' | 'member'; name?: string }>;
  ownerId: string;
}

export interface UserProfile {
  email: string;
  name: string;
  projectIds?: Record<string, boolean>;
}

export type ProjectFormData = Omit<Project, 'id' | 'members' | 'ownerId' | 'tasks'> & {
    memberEmails?: string;
};
