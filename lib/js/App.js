// App.js
"use strict";
const ko = require("knockout");
const path = require("path");
const FileUtil = require("./FileUtil");

function App() {
  const self = this;

  self.editor = null;
  self.current = ko.observable(process.cwd());
  self.filename = ko.observable("");
  self.files = ko.observableArray([]);
  self.samples = ko.observableArray([]);
  self.selectedFile = ko.observable("");

  self.callRefresh = null;

  // 0: list, 1: edit, 2: sample
  self.mode = ko.observable(0);
  self.switchListMode = function(){
    self.load();
    self.mode(0);
  };
  self.switchEditMode = function(){
    self.mode(1);
  };
  self.switchSampleMode = function(){
    self.loadSamples();
    self.mode(2);
  };
  self.isActiveMode = function(mode) {
    return self.mode() === mode;
  }

  self.load = function() {
    const samples = path.join(__dirname, "../../samples");
    const items = FileUtil.glob("**/*.dot", self.current());
    self.files.removeAll();
    items.forEach((item) => {
      // samples以下は除外
      if (item.path.indexOf(samples) < 0) {
        self.files.push(item);
      }
    });
  };

  self.select = function(file) {
    self.selectedFile(file.path);
    self.current(file.path);

    if (self.editor) {
      self.editor.setValue(FileUtil.read(file.path));
      if (typeof self.callRefresh === "function") {
        self.callRefresh();
      }
    }
  };

  self.isActive = function(file) {
    return self.selectedFile() === file.path;
  };

  self.loadSamples = function() {
    const samples = path.join(__dirname, "../../samples");
    const items = FileUtil.glob("**/*.dot", samples);
    self.samples.removeAll();
    items.forEach((item) => {
      self.samples.push(item);
    });
  };

  self.saveDot = function() {
    const data = self.editor.getValue();
    FileUtil.write(self.current(), data);
  };
}

module.exports = App;
