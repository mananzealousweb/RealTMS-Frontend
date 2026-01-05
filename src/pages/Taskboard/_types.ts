export type TaskStatus = "to_do" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Media {
  id: number;
  type: "image" | "document" | "archive";
  path: string;
  created_at: string;
}

export interface Comment {
  id: number;
  comment: string;
  created_at: string;
  author: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  media?: Media[];
  comments?: Comment[];
  owner?: User;
}
