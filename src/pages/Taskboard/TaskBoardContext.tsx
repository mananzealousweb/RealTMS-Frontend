/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useTaskSocket } from "../../hooks/useTaskSocket";
import type { Task } from "./_types";
import { useCommentSocket } from "../../hooks/useCommentSocket";
import { taskService } from "../../services/taskService";
import { commentService } from "../../services/commentService";
import { getDisplayFileName, getPublicFilePath } from "../../utils/helper";

interface TaskBoardContextType {
  // Task State
  tasks: Task[];
  loading: boolean;
  selectedTask: Task | null;

  // Task Actions
  fetchTasks: () => Promise<void>;
  fetchTaskById: (taskId: number) => Promise<void>;
  createTask: (formData: FormData) => Promise<void>;
  updateTask: (taskId: number, formData: FormData) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  selectTask: (task: Task | null) => void;

  // Comment Actions
  addComment: (taskId: number, comment: string) => Promise<void>;
  updateComment: (commentId: number, comment: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;

  handleDownload: (fullPath: string) => Promise<void>;

  // Computed Values
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
}

const TaskBoardContext = createContext<TaskBoardContextType | undefined>(
  undefined
);

export const TaskBoardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTaskById = useCallback(async (taskId: number) => {
    try {
      const task = await taskService.getById(taskId);

      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));

      setSelectedTask((prev) => (prev?.id === task.id ? task : prev));
    } catch {
      toast.error("Failed to refresh task");
    }
  }, []);

  const createTask = async (formData: FormData) => {
    await taskService.create(formData);
    // socket will trigger fetchTasks
  };

  const updateTask = async (taskId: number, formData: FormData) => {
    await taskService.update(taskId, formData);
  };

  const deleteTask = async (taskId: number) => {
    await taskService.delete(taskId);
    setSelectedTask(null);
  };

  const addComment = async (taskId: number, comment: string) => {
    await commentService.create({ task_id: taskId, comment });
  };

  const updateComment = async (commentId: number, comment: string) => {
    await commentService.update(commentId, { comment });
  };

  const deleteComment = async (commentId: number) => {
    await commentService.delete(commentId);
  };

  const handleDownload = async (fullPath: string) => {
    const publicPath = getPublicFilePath(fullPath);
    if (!publicPath) return;

    const filename = getDisplayFileName(fullPath);
    const url = `${import.meta.env.VITE_BACKEND_PATH}/${publicPath}`;

    const res = await fetch(url);
    const blob = await res.blob();

    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  useTaskSocket({
    onTaskCreated: fetchTasks,
    onTaskUpdated: fetchTasks,
    onTaskDeleted: fetchTasks,
  });

  useCommentSocket({
    onCommentAdded: (comment: any) => fetchTaskById(comment.task_id),
    onCommentUpdated: (comment: any) => fetchTaskById(comment.task_id),
    onCommentDeleted: ({ taskId }) => {
      fetchTaskById(taskId);
    },
  });

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const selectTask = (task: Task | null) => {
    if (!task) {
      setSelectedTask(null);
      return;
    }
    setSelectedTask(task);
    fetchTaskById(task.id);
  };

  const todoTasks = tasks.filter((t) => t.status === "to_do");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <TaskBoardContext.Provider
      value={{
        tasks,
        loading,
        selectedTask,
        fetchTasks,
        fetchTaskById,
        createTask,
        updateTask,
        deleteTask,
        selectTask,
        addComment,
        updateComment,
        deleteComment,
        handleDownload,
        todoTasks,
        inProgressTasks,
        doneTasks,
      }}
    >
      {children}
    </TaskBoardContext.Provider>
  );
};

export const useTaskBoard = () => {
  const context = useContext(TaskBoardContext);
  if (context === undefined) {
    throw new Error("useTaskBoard must be used within a TaskBoardProvider");
  }
  return context;
};
