import fs from "fs";
import path from "path";
import type { File } from "@/types/file";
import { FILE_DIRECTORY } from "@/.";
import { randomUUID } from "crypto";

export function traverse(dir: string, files: File[]) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath, files);
    } else {
      const folderName = dir.replace(FILE_DIRECTORY, "");
      files.push({
        folder: folderName === "" ? null : folderName,
        filename: file,
        id: randomUUID(),
      });
    }
  });
}

export function groupByFolderName(files: File[]) {
  const array = files;
  return Object.groupBy(array, ({ folder }) => folder ?? "");
}
