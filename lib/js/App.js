// App.js
"use strict";
const ko = require("knockout");
const FileUtil = require("./FileUtil");

function App() {
  const self = this;

  self.current = ko.observable(process.cwd());
  self.filename = ko.observable("");
  self.files = ko.observableArray([]);

  self.selectedFile = ko.observable("");

  // 0: list, 1: edit, 2: sample
  self.mode = ko.observable(0);
  self.switchListMode = function(){
    self.mode(0);
  };
  self.switchEditMode = function(){
    self.mode(1);
  };
  self.switchSampleMode = function(){
    self.mode(2);
  };
  self.isActiveMode = function(mode) {
    return self.mode() === mode;
  }

  self.load = function() {
    const items = FileUtil.glob(self.current(), "**/*.svg");
    self.files.removeAll();
    items.forEach((item) => {
      self.files.push(item);
    });
  };

  self.select = function(file) {
    self.selectedFile(file.path);
    self.current(file.info.dir);
    self.filename(file.info.base);
  };

  self.isActive = function(file) {
    return self.selectedFile() === file.path;
  };
}

module.exports = App;
