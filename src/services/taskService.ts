import api from "../api/axios";
import type { Task } from "../pages/Taskboard/_types";

export const taskService = {
  // Get all tasks
  getAll: async (): Promise<Task[]> => {
    const response = await api.get("/task");
    return response.data.tasks;
  },

  // Get task by ID
  getById: async (id: number): Promise<Task> => {
    const response = await api.get(`/task/${id}`);
    return response.data.task;
  },

  // Create task
  create: async (formData: FormData): Promise<Task> => {
    const response = await api.post("/task", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.task;
  },

  // Update task
  update: async (id: number, formData: FormData): Promise<Task> => {
    const response = await api.put(`/task/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.task;
  },

  // Delete task
  delete: async (id: number): Promise<void> => {
    await api.delete(`/task/${id}`);
  },
};
