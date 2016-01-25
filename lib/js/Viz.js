// Viz.js
"use strict";
const Viz = require("viz.js");
const FileUtil = require("./FileUtil");
const svgexport = require('svgexport');

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

  toPNG(callback) {
    if (this.svg) {
      const filename = FileUtil.resolve("graph.png");
      const svgFile = this.save();

      svgexport.render([{
        input: [svgFile],
        output:  [filename]
      }], callback);
    }

    return "error.";
  }

  save() {
    if (this.svg) {
      const filename = FileUtil.resolve("graph.svg");
      FileUtil.write(filename, this.svg);
      return filename;
    }

    return "error.";
  }
}

module.exports = MyViz;
