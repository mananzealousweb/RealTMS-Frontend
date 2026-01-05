// hooks/useTaskSocket.ts
import { useEffect, useCallback } from "react";

import { toast } from "sonner";
import type { Task } from "../pages/Taskboard/_types";
import { useSocket } from "../providers/SocketProvider";

interface UseTaskSocketProps {
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: number) => void;
}

export const useTaskSocket = ({
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}: UseTaskSocketProps) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for task created event
    const handleTaskCreated = (data: { task: Task; userId: number }) => {
      toast.success(`New task created: ${data.task.title}`);
      onTaskCreated?.(data.task);
    };

    // Listen for task updated event
    const handleTaskUpdated = (data: { task: Task; userId: number }) => {
      toast.info(`Task updated: ${data.task.title}`);
      onTaskUpdated?.(data.task);
    };

    // Listen for task deleted event
    const handleTaskDeleted = (data: { taskId: number; userId: number }) => {
      toast.info("A task was deleted");
      onTaskDeleted?.(data.taskId);
    };

    // Register event listeners
    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);

    // Cleanup listeners on unmount
    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
    };
  }, [socket, isConnected, onTaskCreated, onTaskUpdated, onTaskDeleted]);

  // Emit events
  const emitTaskCreated = useCallback(
    (task: Task) => {
      if (socket && isConnected) {
        socket.emit("task:created", { task });
      }
    },
    [socket, isConnected]
  );

  const emitTaskUpdated = useCallback(
    (task: Task) => {
      if (socket && isConnected) {
        socket.emit("task:updated", { task });
      }
    },
    [socket, isConnected]
  );

  const emitTaskDeleted = useCallback(
    (taskId: number) => {
      if (socket && isConnected) {
        socket.emit("task:deleted", { taskId });
      }
    },
    [socket, isConnected]
  );

  return {
    isConnected,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
  };
};
