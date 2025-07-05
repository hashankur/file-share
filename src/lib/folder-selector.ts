import inquirer from "inquirer";
import inquirerDirectory from "inquirer-directory";
import path from "path";

// Register the directory plugin
inquirer.registerPrompt("directory", inquirerDirectory);

export async function selectFolder(): Promise<string> {
  const homeDir = process.env.HOME || process.env.USERPROFILE || process.cwd();

  try {
    const answers = await inquirer.prompt([
      {
        type: "directory",
        name: "path",
        message: "Select a folder to share (Ctrl+C to exit):",
        basePath: homeDir,
      },
    ]);

    // If the path is relative, resolve it from the basePath (homeDir)
    // If it's already absolute, path.resolve will return it as-is
    return path.isAbsolute(answers.path)
      ? answers.path
      : path.resolve(homeDir, answers.path);
  } catch (error) {
    // Handle user cancellation (Ctrl+C)
    if (error.name === "AbortPromptError") {
      console.log("\nExiting...");
      process.exit(0);
    }
    throw error;
  }
}
