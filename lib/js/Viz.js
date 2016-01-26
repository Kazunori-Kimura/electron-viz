// Viz.js
"use strict";
const Viz = require("viz.js");
const FileUtil = require("./FileUtil");
const svgexport = require("svgexport");

class MyViz {
  constructor() {
    this.source = "";
    this.svg = "";
  }

  parse(source) {
    this.source = source;
    this.svg = Viz(this.source, { format: "svg", engine: "dot" });
    return this.svg;
  }

  toPNG(filepath, callback) {
    if (this.svg) {
      const svgFile = this.save(filepath);
      const filename = filepath.replace(/\.dot$/, ".png");

      svgexport.render([{
        input: [svgFile],
        output:  [filename]
      }], callback);
    }

    return "error.";
  }

  save(filepath) {
    if (this.svg) {
      const filename = filepath.replace(/\.dot$/, ".svg");
      FileUtil.write(filename, this.svg);
      return filename;
    }

    return "error.";
  }
}

module.exports = MyViz;
