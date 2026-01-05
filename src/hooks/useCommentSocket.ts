import { useEffect, useCallback } from "react";
import { toast } from "sonner";

import type { Comment } from "../pages/Taskboard/_types";
import { useSocket } from "../providers/SocketProvider";

interface UseCommentSocketProps {
  taskId?: number;
  onCommentAdded?: (comment: Comment, commentCount: number) => void;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (payload: {
    commentId: number;
    taskId: number;
    commentCount: number;
  }) => void;
}

export const useCommentSocket = ({
  taskId,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
}: UseCommentSocketProps) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // 📝 Comment Added
    const handleCommentAdded = (data: {
      comment: Comment;
      taskId: number;
      commentCount: number;
      addedBy: number;
    }) => {
      if (taskId && data.taskId !== taskId) return;

      toast.success("New comment added");
      onCommentAdded?.(data.comment, data.commentCount);
    };

    // ✏️ Comment Updated
    const handleCommentUpdated = (data: {
      comment: Comment;
      taskId: number;
      updatedBy: number;
    }) => {
      if (taskId && data.taskId !== taskId) return;

      toast.info("Comment updated");
      onCommentUpdated?.(data.comment);
    };

    // 🗑 Comment Deleted
    const handleCommentDeleted = (data: {
      commentId: number;
      taskId: number;
      commentCount: number;
      deletedBy: number;
    }) => {
      if (taskId && data.taskId !== taskId) return;

      toast.info("Comment deleted");
      onCommentDeleted?.({
        commentId: data.commentId,
        taskId: data.taskId,
        commentCount: data.commentCount,
      });
    };

    socket.on("comment:added", handleCommentAdded);
    socket.on("comment:updated", handleCommentUpdated);
    socket.on("comment:deleted", handleCommentDeleted);

    return () => {
      socket.off("comment:added", handleCommentAdded);
      socket.off("comment:updated", handleCommentUpdated);
      socket.off("comment:deleted", handleCommentDeleted);
    };
  }, [
    socket,
    isConnected,
    taskId,
    onCommentAdded,
    onCommentUpdated,
    onCommentDeleted,
  ]);

  // 🚀 Emitters (optional – usually backend emits)
  const emitCommentAdded = useCallback(
    (comment: Comment) => {
      if (socket && isConnected) {
        socket.emit("comment:added", { comment });
      }
    },
    [socket, isConnected]
  );

  const emitCommentUpdated = useCallback(
    (comment: Comment) => {
      if (socket && isConnected) {
        socket.emit("comment:updated", { comment });
      }
    },
    [socket, isConnected]
  );

  const emitCommentDeleted = useCallback(
    (commentId: number) => {
      if (socket && isConnected) {
        socket.emit("comment:deleted", { commentId });
      }
    },
    [socket, isConnected]
  );

  return {
    isConnected,
    emitCommentAdded,
    emitCommentUpdated,
    emitCommentDeleted,
  };
};
