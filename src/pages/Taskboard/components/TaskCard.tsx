import PriorityBadge from "./PriorityBadge";
import {
  MessageCircle,
  Paperclip,
  Calendar,
  User,
  Edit,
  Trash2,
} from "lucide-react";

import { format } from "date-fns";
import type { Task } from "../_types";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../providers/AuthProvider";
import { useState } from "react";
import DeleteConfirmDialog from "./DeleteConfirmDialogbox";
import TaskFormModal from "./TaskFormModal";
import { useTaskBoard } from "../TaskBoardContext";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { deleteTask, selectTask } = useTaskBoard();
  const commentCount = task.comments?.length || 0;
  const fileCount = task.media?.length || 0;
  const isOwner = user?.id === task.user_id;
  const ownerName = task.owner
    ? `${task.owner.first_name} ${task.owner.last_name}`
    : "Unknown";

  const handleClose = () => {
    selectTask(null);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      setShowDeleteConfirm(false);
      handleClose();
      toast.success("Task deleted successfully");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteConfirm(true);
  };

  return (
    <>
      <Card
        className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
        onClick={() => onClick(task)}
      >
        {/* Title and Action Buttons */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
            {task.title}
          </h3>

          {isOwner && (
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>

        {/* Priority Badge */}
        <div className="mb-3">
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <User className="h-4 w-4" />
          <span>{ownerName}</span>
        </div>

        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(task.due_date), "MMM dd, yyyy")}</span>
          </div>
        )}

        {/* Footer - Comment & File Count */}
        <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t">
          {commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{commentCount}</span>
            </div>
          )}

          {fileCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              <span>{fileCount}</span>
            </div>
          )}
        </div>
      </Card>

      {/* EDIT MODAL */}
      <TaskFormModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        task={task}
      />

      {/* DELETE CONFIRM */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        taskTitle={task.title}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default TaskCard;
