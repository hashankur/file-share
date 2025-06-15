import fs from "fs";
import path from "path";
import { type File } from "@/types/file";
import { FILE_DIRECTORY } from "@/.";

export function traverse(dir: string, files: File[]) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath, files);
    } else {
      let folderName = dir.replace(FILE_DIRECTORY, "");
      files.push({
        folder: folderName === "" ? null : folderName,
        filename: file,
      });
    }
  });
}

export function groupByFolderName(files: File[]) {
  return Object.groupBy(files, ({ folder }) => folder ?? "");
}
