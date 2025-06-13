import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { rateLimit } from "elysia-rate-limit";
import { groupByFolderName, traverse } from "./util/file";
import { address } from "@/util/network";
import HomePage from "@/views/home";
import { type File } from "@/types/file";

const PORT = 8081;
export const FILE_DIRECTORY = "public";

Bun.spawn({
  cmd: [
    "bunx",
    "tailwindcss",
    "-i",
    "./src/assets/main.css",
    "-o",
    "./public/output.css",
  ],
});

const app = new Elysia()
  .use(html())
  .use(staticPlugin({ prefix: "/", noCache: true }))
  .use(
    staticPlugin({
      prefix: "/assets",
      assets: FILE_DIRECTORY,
      enableDecodeURI: true,
    }),
  )
  .use(
    rateLimit({
      duration: 60000, // 1 minute window
      max: 10, // max requests per window per IP
    }),
  )
  .get("/", () => {
    return HomePage();
  })
  .get("/files", () => {
    const files: File[] = [];
    traverse(FILE_DIRECTORY, files);
    return groupByFolderName(files);
  })
  .listen(PORT);

console.log(`Server is running at ${address()}:${app.server?.port}`);
