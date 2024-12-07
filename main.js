const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 8081;

const fileDirectory = "public";

app.use(express.static(fileDirectory));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/files", (req, res) => {
  const files = [];

  function traverse(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        traverse(fullPath);
      } else {
        files.push(fullPath.replace(fileDirectory, ""));
      }
    });
  }

  traverse(fileDirectory);

  res.json(files);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
