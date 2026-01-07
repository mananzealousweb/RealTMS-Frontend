import {
  Image as ImageIcon,
  FileText,
  Paperclip,
  FileArchiveIcon,
} from "lucide-react";
import { AVATAR_COLORS } from "./constant";
import moment from "moment";

export const getDisplayFileName = (fullPath: string) => {
  const normalized = fullPath.replace(/\\/g, "/");
  const rawName = normalized.split("/").pop() || "";

  // Removes: 1767681026422-647171185-
  return rawName.replace(/^\d+-\d+-/, "");
};

export const getPublicFilePath = (fullPath: string) => {
  const normalized = fullPath.replace(/\\/g, "/");
  const index = normalized.indexOf("/uploads/");

  if (index === -1) return null;

  return normalized.substring(index + 1);
};

export const getMediaIcon = (type: string) => {
  switch (type) {
    case "image":
      return ImageIcon;
    case "document":
      return FileText;
    case "archive":
      return FileArchiveIcon;
    default:
      return Paperclip;
  }
};

export const getFileIcon = (file: File) => {
  if (file.type.startsWith("image/")) return ImageIcon;
  if (file.type.includes("zip")) return FileArchiveIcon;
  return FileText;
};

export const getImagePreview = (file: File) => {
  if (!file.type.startsWith("image/")) return null;
  return URL.createObjectURL(file);
};

export const getAvatar = (first?: string, last?: string) => {
  const initials = `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
  const key = `${first ?? ""}${last ?? ""}`.toLowerCase();
  const index = hashString(key) % AVATAR_COLORS.length;
  const colorTheme = key ? AVATAR_COLORS[index] : AVATAR_COLORS[0];
  return { initials, colorTheme };
};

export const hashString = (str: string) => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash);
};

export const dueDatePassed = (
  dueDate?: string | Date | null
): boolean | null => {
  if (!dueDate) return null;

  const dueMoment = moment(dueDate);

  return dueMoment.isBefore(moment());
};

export const toLocalDatetime = (date: string | Date) => {
  return moment(date).local().format("YYYY-MM-DDTHH:mm");
};
