import {
  MessageCircle,
  Paperclip,
  Calendar,
  Edit,
  Trash2,
  GripVertical,
  ClockAlertIcon,
} from "lucide-react";

import moment from "moment";
import type { Task } from "../_types";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../providers/AuthProvider";
import { useState } from "react";
import DeleteConfirmDialog from "./DeleteConfirmDialogbox";
import TaskFormModal from "./TaskFormModal";
import { useTaskBoard } from "../TaskBoardContext";
import EditablePriorityBadge from "./EditablePriorityBadge";
import UserAvatar from "./UserAvatar";
import { dueDatePassed } from "../../../utils/helper";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [canDrag, setCanDrag] = useState(false);

  const { user } = useAuth();
  const { deleteTask } = useTaskBoard();
  const commentCount = task.comments?.length || 0;
  const fileCount = task.media?.length || 0;
  const isOwner = user?.id === task.user_id;
  const isOverdue = dueDatePassed(task.due_date);
  // const ownerName = task.owner
  //   ? `${task.owner.first_name} ${task.owner.last_name}`
  //   : "Unknown";

  const handleDragStart = (e: React.DragEvent) => {
    if (!isOwner) return;
    e.dataTransfer.setData("taskId", String(task.id));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setCanDrag(false); // reset after drag
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
        draggable={canDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => onClick(task)}
        className={`
    p-4 transition-shadow
    ${
      isOwner
        ? "bg-white border-l-4 border-indigo-500"
        : "bg-neutral-50 opacity-85"
    }
    hover:shadow-md cursor-pointer
  `}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1">
            {/* DRAG HANDLE (OWNER ONLY) */}
            {isOwner && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setCanDrag(true);
                }}
                onMouseUp={() => setCanDrag(false)}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 pt-1"
                title="Drag task"
              >
                <GripVertical className="h-5 w-5" />
              </div>
            )}

            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {task.title}
            </h3>
          </div>

          {/* ACTION BUTTONS */}

          <div
            className="flex gap-1 items-center"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <UserAvatar
              first={task.owner?.first_name}
              last={task.owner?.last_name}
            />
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                className="cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        </div>

        {/* PRIORITY */}
        <div onClick={(e) => e.stopPropagation()} className="mb-3">
          <EditablePriorityBadge
            taskId={task.id}
            priority={task.priority}
            disabled={!isOwner}
          />
        </div>

        {/* Owner */}
        {/* <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <UserAvatar
            first={task.owner?.first_name}
            last={task.owner?.last_name}
          />
          <span className="truncate">{ownerName}</span>
        </div> */}

        {/* Due Date */}
        {task.due_date && (
          <div className="mb-3">
            <div
              className={`flex items-center gap-2 text-sm ${
                isOverdue ? "text-red-600 font-medium" : "text-gray-600"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>{moment(task.due_date).format("MMM DD, YYYY, HH:mm")}</span>
            </div>

            {isOverdue && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <ClockAlertIcon className="h-4 w-4" />
                <span>Due date has passed</span>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t">
          {commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {commentCount}
            </div>
          )}

          {fileCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              {fileCount}
            </div>
          )}
        </div>
      </Card>

      {/* EDIT + DELETE MODALS */}
      <TaskFormModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        task={task}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        taskTitle={task.title}
        isDeleting={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true);
          await deleteTask(task.id);
          setIsDeleting(false);
        }}
      />
    </>
  );
};

export default TaskCard;
