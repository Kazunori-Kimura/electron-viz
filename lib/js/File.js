// File.js
"use strict";

class File {
  constructor() {
    this.path = "";
    this.info = {
      root : "",
      dir : "",
      base : "",
      ext : "",
      name : ""
    };
    this.relative = "";
  }
}

module.exports = File;
