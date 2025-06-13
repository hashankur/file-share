import { Elysia } from "elysia";
import { html, Html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import fs from "fs";
import path from "path";
import { networkInterfaces } from "os";

type File = {
  folder: string | null;
  filename: string;
};

const PORT = 8081;
const FILE_DIRECTORY = "/public";
const TITLE = "File Share";

Bun.spawn({
  cmd: [
    "tailwindcss",
    "-i",
    "./src/assets/main.css",
    "-o",
    "./public/output.css",
  ],
});

// Get IPv4 network addresses (non-internal)
function address() {
  const nets = networkInterfaces();
  const results = Object.create(null);

  for (const name of Object.keys(nets)) {
    if (nets[name] === undefined) return "localhost";
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) results[name] = [];
        results[name].push(net.address);
      }
    }
  }
  return Object.values(results)[0];
}

function traverse(dir: string, files: File[]) {
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

function groupByFolderName(files: File[]) {
  return Object.groupBy(files, ({ folder }) => folder ?? "");
}

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
  .get("/", () => {
    const files: File[] = [];
    traverse(FILE_DIRECTORY, files);
    const payload = groupByFolderName(files);

    return (
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="stylesheet" href="output.css" />
          <title>{TITLE}</title>
        </head>
        <body class="bg-neutral-950 text-neutral-400 container mx-auto my-10 px-5 break-all">
          <h1 class="text-4xl font-bold">{TITLE}</h1>
          {Object.keys(payload)
            .sort((a, b) => new Intl.Collator().compare(a, b))
            .map((folder) => (
              <>
                <h2 class="text-2xl font-bold mt-8 my-5">
                  {folder ? folder : "/"}
                </h2>
                <div class="flex flex-col divide-y-1 divide-neutral-800">
                  {payload[folder]
                    ?.sort((a, b) =>
                      new Intl.Collator().compare(a.filename, b.filename),
                    )
                    .map((file) => (
                      <a
                        class="text-blue-400 p-3 hover:bg-neutral-400 hover:text-neutral-950 visited:text-purple-400"
                        href={`assets/${file.folder ? file.folder + "/" : ""}${file.filename}`}
                      >
                        {file.filename}
                      </a>
                    ))}
                </div>
              </>
            ))}
        </body>
      </html>
    );
  })
  .get("/files", () => {
    const files: File[] = [];
    traverse(FILE_DIRECTORY, files);
    return groupByFolderName(files);
  })
  .listen(PORT);

console.log(`Server is running at ${address()}:${app.server?.port}`);
