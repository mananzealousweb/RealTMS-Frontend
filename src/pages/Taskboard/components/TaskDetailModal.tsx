/* eslint-disable @typescript-eslint/no-explicit-any */
import PriorityBadge from "./PriorityBadge";
import { Calendar, User, Download, Paperclip } from "lucide-react";
import { format } from "date-fns";

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

interface TaskDetailModalProps {
  isOpen: boolean;
  currentUserId?: number;
  task?: any;
  onClose?: any;
}

const TaskDetailModal = ({ isOpen, currentUserId }: TaskDetailModalProps) => {
  const { selectedTask: task, selectTask } = useTaskBoard();

  if (!task) return null;

  const ownerName = task.owner
    ? `${task.owner.first_name} ${task.owner.last_name}`
    : "Unknown";

  const statusLabels = {
    to_do: "To Do",
    in_progress: "In Progress",
    done: "Done",
  };

  const handleClose = () => {
    selectTask(null);
  };

  const handleDownload = (filePath: string) => {
    const filename = filePath.split("/").pop() || "file";
    const url = `${import.meta.env.VITE_BACKEND_PATH}/${filePath}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                <PriorityBadge priority={task.priority} />
                <Badge variant="outline">{statusLabels[task.status]}</Badge>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{ownerName}</span>
                </div>

                {task.due_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(task.due_date), "MMM dd, yyyy")}
                    </span>
                  </div>
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
                      Attached Files ({task?.media.length})
                    </h3>

                    <div className="space-y-2">
                      {task?.media.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Paperclip className="h-4 w-4 text-gray-400" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.path.split("/").pop()}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {file.type}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(file.path)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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
