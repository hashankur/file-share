import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import type { File } from "@/types/file";

export function traverse(dir: string, files: File[], fileDirectory: string) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath, files, fileDirectory);
    } else {
      const folderName = dir.replace(fileDirectory, "");
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
