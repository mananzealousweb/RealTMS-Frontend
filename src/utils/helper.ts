import {
  Image as ImageIcon,
  FileText,
  Paperclip,
  FileArchiveIcon,
} from "lucide-react";

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
