// FileUtil.js
"use strict";
const remote = require("remote");
const fs = remote.require("fs");
const path = remote.require("path");
const glob = remote.require("glob");
const File = require("./File");

const encoding = "utf-8";

module.exports = {
  current: () => {
    return process.cwd();
  },

  resolve: (filename) => {
    return path.resolve(process.cwd(), filename);
  },

  glob: (pattern, currentPath) => {
    const matches = glob.sync(pattern, { cwd: currentPath });

    const files = [];
    matches.forEach((item) => {
      const f = new File();
      f.path = path.resolve(currentPath, item);
      f.info = path.parse(f.path);
      f.relative = f.path.replace(currentPath, "");
      files.push(f);
    });

    return files;
  },

  read: (filepath) => {
    return fs.readFileSync(filepath, { encoding });
  },

  write: (filepath, data) => {
    fs.writeFileSync(filepath, data, { encoding });
  },

  writeBase64: (filepath, data) => {
    fs.writeFileSync(filepath, data, { encoding: "base64" });
  }
};
