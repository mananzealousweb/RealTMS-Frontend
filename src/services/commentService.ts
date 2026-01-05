import api from "../api/axios";
import type { Comment } from "../pages/Taskboard/_types";

export const commentService = {
  /**
   * ➕ Add comment to a task
   */
  create: async (payload: {
    task_id: number;
    comment: string;
  }): Promise<Comment> => {
    const response = await api.post("/comment", payload);
    return response.data.comment;
  },

  /**
   * 📄 Get all comments for a task
   */
  getByTask: async (taskId: number): Promise<Comment[]> => {
    const response = await api.get(`/comment/task/${taskId}`);
    return response.data.comments;
  },

  /**
   * ✏️ Update a comment
   */
  update: async (
    commentId: number,
    payload: { comment: string }
  ): Promise<Comment> => {
    const response = await api.put(`/comment/${commentId}`, payload);
    return response.data.comment;
  },

  /**
   * 🗑 Delete a comment
   */
  delete: async (commentId: number): Promise<void> => {
    await api.delete(`/comment/${commentId}`);
  },
};
