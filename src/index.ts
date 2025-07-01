import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { logger } from "@tqman/nice-logger";
import archiver from "archiver";
import { Elysia } from "elysia";
import path from "path";
import { Readable as NodeReadable } from "stream";
import type { File } from "@/types/file";
import { groupByFolderName, traverse } from "@/util/file";
import { address } from "@/util/network";
import HomePage from "@/views/home";

const PORT = 8081;
export const FILE_DIRECTORY = "public";

export const fileDirectory = path.normalize(FILE_DIRECTORY + path.sep);
const files: File[] = [];
traverse(fileDirectory, files);
const filesGrouped = groupByFolderName(files);

const app = new Elysia()
  .use(html())
  .use(staticPlugin({ prefix: "/", noCache: true }))
  .use(logger({ withTimestamp: true }))
  .get("/", () => {
    return HomePage(filesGrouped);
  })
  .get("/files", () => {
    return filesGrouped;
  })
  .get("/download/:id", ({ params: { id } }) => {
    const item = files.find((file) => file.id === id);

    if (!item) {
      return new Response("File not found", { status: 404 });
    }

    const path = new URL(
      item.folder ? `${item.folder}/${item.filename}` : item.filename,
      `file://${fileDirectory}`,
    );
    const file = Bun.file(path);

    const headers = new Headers();
    headers.set("Content-Type", file.type);
    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(item.filename)}`,
    );

    console.info(item.filename);
    return new Response(file, { headers });
  })
  .get("/download", async ({ query: { folder } }) => {
    if (!folder) {
      return new Response("Folder name query parameter is required", {
        status: 400,
      });
    }

    const archive = archiver("zip");
    const folderFiles = filesGrouped[folder as string];

    if (!folderFiles || folderFiles.length === 0) {
      // Ensure the archive stream is ended even if no files are added
      archive.finalize();
      return new Response("Folder not found or is empty", { status: 404 });
    }

    for (const item of folderFiles) {
      const filePath = path.join(
        fileDirectory,
        item.folder ? `${item.folder}/${item.filename}` : item.filename,
      );
      try {
        // Add file to archive using its stream. Bun.file().stream() returns a ReadableStream.
        // Convert Web ReadableStream to Node.js Readable stream for archiver compatibility.
        const fileStream = NodeReadable.from(Bun.file(filePath).stream());
        archive.append(fileStream, { name: item.filename });
      } catch (error) {
        console.error(`Failed to add file ${item.filename} to archive:`, error);
      }
    }

    // Finalize the archive stream once all files are added
    archive.finalize();

    // The archive stream itself is a Node.js Readable stream, convert it to Web ReadableStream for Response
    const content = NodeReadable.toWeb(archive) as ReadableStream<Uint8Array>;

    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(folder)}.zip`,
    );

    return new Response(content, { headers });
  })
  .listen({ port: PORT, idleTimeout: 30 });

console.log(`Server is running at ${address()}:${app.server?.port}`);
