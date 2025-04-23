const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const { networkInterfaces } = require("os");

const port = 8081;
const fileDirectory = "public";

const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === "IPv4" && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

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
  console.log(`Server listening on: ${Object.values(results)[0]}:${port}`); // Get first network interface
  // console.log(`Server listening on: ${results.wlo1[0]}:${port}`); // Change wlo1 to your network interface
});
