/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, ClockAlertIcon, Download, Paperclip } from "lucide-react";
import moment from "moment";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import CommentSection from "./CommentSection";

import { useTaskBoard } from "../TaskBoardContext";
import {
  dueDatePassed,
  getDisplayFileName,
  getMediaIcon,
  getPublicFilePath,
} from "../../../utils/helper";
import EditablePriorityBadge from "./EditablePriorityBadge";
import UserAvatar from "./UserAvatar";

interface TaskDetailModalProps {
  isOpen: boolean;
  currentUserId?: number;
  task?: any;
  onClose?: any;
}

const TaskDetailModal = ({ isOpen, currentUserId }: TaskDetailModalProps) => {
  const { selectedTask: task, selectTask, handleDownload } = useTaskBoard();

  if (!task) return null;

  // const ownerName = task.owner
  //   ? `${task.owner.first_name} ${task.owner.last_name}`
  //   : "Unknown";
  const isOverdue = dueDatePassed(task.due_date);
  const statusLabels = {
    to_do: "To Do",
    in_progress: "In Progress",
    done: "Done",
  };

  const handleClose = () => {
    selectTask(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* HEADER */}
          <DialogHeader className="flex-shrink-0 border-b pb-4">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-2xl font-semibold pr-8">
                {task.title}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6 py-4">
              {/* META */}
              <div className="flex flex-wrap gap-4">
                <EditablePriorityBadge
                  key={task.priority}
                  taskId={task.id}
                  priority={task.priority}
                  disabled={true}
                />
                <Badge variant="outline">{statusLabels[task.status]}</Badge>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserAvatar
                    first={task.owner?.first_name}
                    last={task.owner?.last_name}
                  />
                </div>

                {task.due_date && (
                  <>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isOverdue ? "text-red-600 font-medium" : "text-gray-600"
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>
                        {moment(task.due_date).format("MMM DD, YYYY, HH:mm")}
                      </span>
                    </div>

                    {isOverdue && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <ClockAlertIcon className="h-4 w-4" />
                        <span>Due date has passed</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Separator />

              {/* DESCRIPTION */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {task.description || "No description provided"}
                </p>
              </div>

              {/* FILES */}
              {task?.media && task?.media?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Attachments ({task.media.length})
                    </h3>

                    <div className="space-y-2">
                      {task.media.map((file) => {
                        const Icon = getMediaIcon(file.type);
                        const fileUrl =
                          file.type === "image"
                            ? `${
                                import.meta.env.VITE_BACKEND_PATH
                              }/${getPublicFilePath(file.path)}`
                            : null;

                        return (
                          <div
                            key={file.id}
                            className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg transition"
                          >
                            {/* LEFT */}
                            <div className="flex items-center gap-3 min-w-0">
                              {/* IMAGE PREVIEW OR ICON */}
                              {file.type === "image" && fileUrl ? (
                                <img
                                  src={fileUrl}
                                  alt={getDisplayFileName(file.path)}
                                  className="h-12 w-12 rounded object-cover border"
                                />
                              ) : (
                                <div className="h-12 w-12 flex items-center justify-center rounded bg-white border">
                                  <Icon className="h-5 w-5 text-gray-500" />
                                </div>
                              )}

                              {/* FILE INFO */}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {getDisplayFileName(file.path)}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {file.type}
                                </p>
                              </div>
                            </div>

                            {/* RIGHT */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(file.path)}
                              className="cursor-pointer"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* COMMENTS */}
              <Separator />
              <CommentSection
                taskId={task.id}
                initialComments={task.comments || []}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskDetailModal;
