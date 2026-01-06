/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, type DragEvent } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { Upload, X, Trash2, } from "lucide-react";

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
import {
  getDisplayFileName,
  getMediaIcon,
  getPublicFilePath,
} from "../../../utils/helper";

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
    validateOnBlur: true,
    validateOnChange: false,
    validateOnMount: false,
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

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      setNewFiles([]);
      setRemovedMedia([]);
      setDragActive(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && isEdit && task) {
      formik.resetForm({
        values: {
          title: task.title || "",
          description: task.description || "",
          status: task.status || "to_do",
          priority: task.priority || "medium",
          due_date: task.due_date ? task.due_date.slice(0, 16) : "",
        },
      });

      setRemovedMedia([]);
      setNewFiles([]);
    }
  }, [open, isEdit, task?.id]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* TITLE */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-red-500">{formik.errors.title}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={4}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500">
                {formik.errors.description}
              </p>
            )}
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
          <div className="space-y-1">
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="datetime-local"
              name="due_date"
              value={formik.values.due_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.due_date && formik.errors.due_date && (
              <p className="text-sm text-red-500">{formik.errors.due_date}</p>
            )}
          </div>

          {/* EXISTING MEDIA (EDIT ONLY) */}
          {isEdit && task?.media && task?.media?.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Existing Files</label>

              <div className="space-y-2">
                {task.media
                  .filter((m) => !removedMedia.includes(m.path))
                  .map((media) => {
                    const Icon = getMediaIcon(media.type);
                    const imageUrl =
                      media.type === "image"
                        ? `${
                            import.meta.env.VITE_BACKEND_PATH
                          }/${getPublicFilePath(media.path)}`
                        : null;

                    return (
                      <div
                        key={media.id}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition"
                      >
                        {/* LEFT */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* IMAGE PREVIEW OR ICON */}
                          {media.type === "image" && imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={getDisplayFileName(media.path)}
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
                              {getDisplayFileName(media.path)}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {media.type}
                            </p>
                          </div>
                        </div>

                        <div className="flex">
                          {/* REMOVE */}
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => markMediaForRemoval(media)}
                            className="cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          {/* RIGHT */}
                          {/* <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(media?.path)}
                            className="cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </div>
                    );
                  })}
              </div>
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
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">
              {isEdit ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormModal;
