import { useState, type DragEvent } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { Upload, X, Trash2 } from "lucide-react";

import { useTaskBoard } from "../TaskBoardContext";
import {
  CREATE_TASK_SCHEMA,
  UPDATE_TASK_SCHEMA,
} from "../../../utils/validationSchema";
import { ALLOWED_FILE_EXTENSIONS, MAX_FILES } from "../../../utils/constant";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

import type { Task, Media } from "../_types";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  task?: Task; // required for edit
}

const ALL_EXTENSIONS = Object.values(ALLOWED_FILE_EXTENSIONS).flat();

const TaskFormModal = ({ open, onClose, mode, task }: Props) => {
  const { createTask, updateTask } = useTaskBoard();

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedMedia, setRemovedMedia] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const isEdit = mode === "edit";

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "to_do",
      priority: task?.priority || "medium",
      due_date: task?.due_date ? task.due_date.slice(0, 16) : "",
    },
    validationSchema: isEdit ? UPDATE_TASK_SCHEMA : CREATE_TASK_SCHEMA,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
          if (value) formData.append(key, value as string);
        });

        newFiles.forEach((file) => formData.append("files", file));

        if (isEdit && removedMedia.length > 0) {
          formData.append("remove_media", JSON.stringify(removedMedia));
        }

        if (isEdit && task) {
          await updateTask(task.id, formData);
          toast.success("Task updated");
        } else {
          await createTask(formData);
          toast.success("Task created");
        }

        onClose();
        setNewFiles([]);
        setRemovedMedia([]);
      } catch {
        toast.error(isEdit ? "Failed to update task" : "Failed to create task");
      }
    },
  });

  const validateFiles = (incoming: File[]) => {
    if (newFiles.length + incoming.length > MAX_FILES) {
      toast.error(`Max ${MAX_FILES} files allowed`);
      return false;
    }

    const invalid = incoming.find((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      return !ALL_EXTENSIONS.includes(ext);
    });

    if (invalid) {
      toast.error(`Invalid file type: ${invalid.name}`);
      return false;
    }

    return true;
  };

  const handleFiles = (incoming: File[]) => {
    if (!validateFiles(incoming)) return;
    setNewFiles((prev) => [...prev, ...incoming]);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const markMediaForRemoval = (media: Media) => {
    setRemovedMedia((prev) => [...prev, media.path]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* TITLE */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input {...formik.getFieldProps("title")} />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea {...formik.getFieldProps("description")} rows={4} />
          </div>

          {/* STATUS + PRIORITY */}
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={formik.values.status}
              onValueChange={(v) => formik.setFieldValue("status", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="to_do">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <label className="text-sm font-medium">Priority</label>
            <Select
              value={formik.values.priority}
              onValueChange={(v) => formik.setFieldValue("priority", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* DUE DATE */}
          <Input type="datetime-local" {...formik.getFieldProps("due_date")} />

          {/* EXISTING MEDIA (EDIT ONLY) */}
          {isEdit && task?.media && task?.media?.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Existing Files</label>
              {task.media
                .filter((m) => !removedMedia.includes(m.path))
                .map((media) => (
                  <div
                    key={media.id}
                    className="flex items-center justify-between border rounded px-3 py-2 text-sm"
                  >
                    <span className="overflow-auto">
                      {media.path.split("/").pop()}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => markMediaForRemoval(media)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
            </div>
          )}

          {/* DROPZONE */}
          <Card
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`border-dashed p-6 text-center ${
              dragActive ? "border-primary bg-primary/5" : ""
            }`}
          >
            <input
              type="file"
              multiple
              hidden
              id="file-input"
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            />
            <label
              htmlFor="file-input"
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">
                Drag & drop or <u>browse</u>
              </span>
            </label>
          </Card>

          {/* NEW FILES */}
          {newFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex justify-between border rounded px-3 py-2 text-sm"
            >
              {file.name}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeNewFile(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* ACTIONS */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormModal;
