import { Elysia } from "elysia";
import { html, Html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import fs from "fs";
import path from "path";
import { networkInterfaces } from "os";

type File = {
  folder: string;
  filename: string;
};

const PORT = 8081;
const FILE_DIRECTORY = "/public";
const TITLE = "File Share";

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
      files.push({
        folder: dir.replace(FILE_DIRECTORY, ""),
        filename: file,
      });
    }
  });
}

function groupByFolderName(files: File[]) {
  return Object.groupBy(files, ({ folder }) => folder);
}

const app = new Elysia()
  .use(html())
  .use(
    staticPlugin({
      prefix: "/", // Serve static files from the root
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
          <title>{TITLE}</title>
        </head>
        <body style={{ backgroundColor: "#0b0e14", color: "#bfbfb6" }}>
          <h1>{TITLE}</h1>
          {Object.keys(payload)
            .sort((a, b) => new Intl.Collator().compare(a, b))
            .map((folder) => (
              <>
                <h2 style={{ marginTop: "2em" }}>
                  {folder === "" ? "/ (Index)" : folder}
                </h2>
                {payload[folder]
                  ?.sort((a, b) =>
                    new Intl.Collator().compare(a.filename, b.filename),
                  )
                  .map((file) => (
                    <p>
                      <a href={`${file.folder}/${file.filename}`}>
                        {file.filename}
                      </a>
                    </p>
                  ))}
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
