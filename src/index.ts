import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import type { File } from "@/types/file";
import { groupByFolderName, traverse } from "@/util/file";
import { address } from "@/util/network";
import HomePage from "@/views/home";

const PORT = 8081;
export const FILE_DIRECTORY = "public";

const files: File[] = [];
traverse(FILE_DIRECTORY, files);
const filesGrouped = groupByFolderName(files);

const app = new Elysia()
  .use(html())
  .use(staticPlugin({ prefix: "/", noCache: true }))
  .use(
    rateLimit({
      duration: 60000, // 1 minute window
      max: 10, // max requests per window per IP
    }),
  )
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
      `file://${FILE_DIRECTORY}`,
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
  .listen({ port: PORT, idleTimeout: 30 });

console.log(`Server is running at ${address()}:${app.server?.port}`);
