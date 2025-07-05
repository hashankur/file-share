import { Html } from "@elysiajs/html";
import type { File } from "@/types/file";

const TITLE = "File Share";

export default function HomePage(payload: Partial<Record<string, File[]>>) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="output.css" />
        <title>{TITLE}</title>
      </head>
      <body class="bg-neutral-950 text-neutral-400 container mx-auto my-10 px-5 break-all">
        <h1 class="text-3xl/loose md:text-4xl/loose font-bold mb-5">{TITLE}</h1>

        <div class="space-y-5">
          {Object.keys(payload)
            .sort((a, b) => new Intl.Collator().compare(a, b))
            .map((folder) => (
              <details class="group">
                <summary class="flex items-center border-b-2 border-neutral-600 gap-3">
                  <h2 class="text-lg/loose md:text-xl/loose font-bold grow flex items-center">
                    <a href={`/download?folder=${folder}`} class="p-2">
                      <img
                        src="/icons/folder-down.svg"
                        alt="Folder Download Icon"
                        class="block size-5 invert"
                      />
                    </a>
                    {folder ? folder : "/"}
                  </h2>
                  <div class="p-1.5 invert">
                    <img
                      src="/icons/plus.svg"
                      alt="Plus Icon"
                      class="block size-5 group-open:hidden"
                    />
                    <img
                      src="/icons/minus.svg"
                      alt="Minus Icon"
                      class="hidden size-5 group-open:block"
                    />
                  </div>
                </summary>
                <div class="flex flex-col mt-3 divide-y-1 divide-neutral-800">
                  {payload[folder]
                    ?.sort((a: { filename: string }, b: { filename: string }) =>
                      new Intl.Collator().compare(a.filename, b.filename),
                    )
                    .map((file: File) => (
                      <a
                        class="text-blue-400 px-5 py-3 hover:bg-neutral-900 visited:text-purple-400"
                        href={`/download/${file.id}`}
                      >
                        {file.filename}
                      </a>
                    ))}
                </div>
              </details>
            ))}
        </div>
      </body>
    </html>
  );
}
