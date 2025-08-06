import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import { downloadFile, downloadFolder } from "@/lib/download-handlers";
import { initializeFiles } from "@/lib/file-init";
import { selectFolder } from "@/lib/folder-selector";
import { address } from "@/util/network";
import HomePage from "@/views/home";

const PORT = 8081;

// Handle graceful exit
process.on("SIGINT", () => {
  console.log("\nExiting...");
  process.exit(0);
});

async function startServer() {
  const selectedFolder = await selectFolder();

  const { fileDirectory, files, filesGrouped } =
    await initializeFiles(selectedFolder);

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
    .get("/download/file/:file", downloadFile(fileDirectory, files))
    .get("/download/folder/*", downloadFolder(fileDirectory, filesGrouped))
    .listen({ port: PORT, idleTimeout: 30 });

  console.log(`Server is running at ${address()}:${app.server?.port}\n`);
}

startServer();
