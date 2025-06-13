import { Html } from "@elysiajs/html";
import { groupByFolderName, traverse } from "@/util/file";
import { type File } from "@/types/file";
import { FILE_DIRECTORY } from "@/.";

const TITLE = "File Share";

export default function HomePage() {
  const files: File[] = [];
  traverse(FILE_DIRECTORY, files);
  const payload = groupByFolderName(files);

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
}
