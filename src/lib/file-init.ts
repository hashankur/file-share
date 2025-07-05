import path from "path";
import type { File } from "@/types/file";
import { groupByFolderName, traverse } from "@/util/file";

export interface FileInitResult {
  fileDirectory: string;
  files: File[];
  filesGrouped: Partial<Record<string, File[]>>;
}

export async function initializeFiles(
  selectedFolder: string,
): Promise<FileInitResult> {
  console.log(`Selected folder: ${selectedFolder}`);
  console.log("Scanning files...");

  const fileDirectory = path.normalize(selectedFolder + path.sep);
  const files: File[] = [];
  traverse(fileDirectory, files, fileDirectory);
  const filesGrouped = groupByFolderName(files);

  console.log(
    `Found ${files.length} files in ${Object.keys(filesGrouped).length} folders\n`,
  );

  return { fileDirectory, files, filesGrouped };
}
