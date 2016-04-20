"use strict";
const fs = require("electron").remote.require("fs-extra-promise");
const dialog = require("@kazunori-kimura/electron-dialog-promise");
const myUtil = require("./my-util.js");
const co = require("co");
const viz = require("viz.js");
const parser = new DOMParser();

$(function(){
  let timer = 0;
  let isEdit = false;
  
  // codemirrorのインスタンス化
  const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true
  });
  
  // 変更があったら更新処理
  editor.on("change", () => {
    isEdit = true;
  });
  
  // new: 新しいファイル
  $("#btnNew").on("click", (ev) => {
    ev.preventDefault();
    
    co(function*(){
      // 確認
      const response = yield dialog.showMessageBoxAsync({
        type: "question",
        buttons: ["Cancel", "OK"],
        defaultId: 0,
        title: "新規作成",
        message: "ファイルを保存していない場合、変更が失われます。\nよろしいですか？",
        cancelId: 0
      });
      
      if (response === 1) {
        // OKクリック時 内容をクリア
        $("#openFile").val("");
        editor.setValue("");
        $("#preview").find("svg").remove();
      }
    });
  });
  
  // open: ファイル選択ダイアログを表示
  $("#btnOpen").on("click", (ev) => {
    ev.preventDefault();
    co(function*(){
      const files = yield dialog.showOpenDialogAsync({
        filters: [
          { name: 'dot file', extensions: ['dot'] }
        ], 
        properties: ["openFile"]
      });
      if (files) {
        $("#openFile").val(files[0]);
        
        const data = yield fs.readFileAsync(files[0], "utf-8");
        editor.setValue(data);
        
        updatePreview(data, $("#preview"));
      }
    }).catch((err) => {
      console.error(err);
    });
  });
  
  // save: ファイル保存
  $("#btnSave").on("click", (ev) => {
    ev.preventDefault();
    co(function*(){
      let filePath = $("#openFile").val();
      
      if (myUtil.isNullOrEmpty(filePath)) {
        // ファイル保存ダイアログを開く
        filePath = yield dialog.showSaveDialogAsync({
          filters: [{ name: 'dot file', extensions: ['dot'] }]
        });
        
        if (myUtil.isNullOrEmpty(filePath)) {
          return;
        }
        $("#openFile").val(filePath);
      }
      
      // ファイル書き込み
      const data = editor.getValue();
      yield fs.outputFileAsync(filePath, data, "utf8");
      console.log(`saved: ${filePath}.`);
    }).catch((err) => {
      console.error(err);
    });
  });
  
  // export svg
  $("#btnExport").on("click", (ev) => {
    ev.preventDefault();
    
    co(function*(){
      // dot file
      let dotFilePath = $("#openFile").val();
      if (myUtil.isNullOrEmpty(dotFilePath)) {
        // ファイル保存ダイアログを開く
        filePath = yield dialog.showSaveDialogAsync({
          filters: [{ name: 'dot file', extensions: ['dot'] }]
        });
        
        if (myUtil.isNullOrEmpty(filePath)) {
          return;
        }
        $("#openFile").val(filePath);
      }
      // svg file
      const svgFilePath = dotFilePath.replace(/\.dot$/, ".svg");
      // png file
      const pngFilePath = dotFilePath.replace(/\.dot$/, ".png");
      
      // save dot file
      const data = editor.getValue();
      if (!(typeof data == "string" && data.length > 0)) {
        return;
      }
      const svg = updatePreview(data);
      // save svg file
      yield fs.outputFileAsync(svgFilePath, svg, "utf8");
      console.log(`saved: ${svgFilePath}.`);
    }).catch((err) => {
      console.error(err);
    });
  });
  
  // preview
  $("#btnPreview").on("click", (ev) => {
    ev.preventDefault();
    const data = editor.getValue();
    updatePreview(data, $("#preview"));
  });
  
  // auto preview: 自動更新モードのtoggle
  $("#btnSync").on("click", (ev) => {
    ev.preventDefault();
    $(ev.target).toggleClass("active").blur();
    
    if ($(ev.target).hasClass("active")) {
      timer = setInterval(() => {
        if (isEdit) {
          const data = editor.getValue();
          updatePreview(data, $("#preview"));
        }
      }, 500);
    } else {
      clearInterval(timer);
      timer = 0;
    }
  });
  
  /**
   * preview更新
   */
  function updatePreview(dot, canvas){
    // parse dot -> svg
    const xml = viz(dot, { format: "svg", engine: "dot" });
    // canvas に svgタグをappend
    if (canvas) {
      const svg = parser.parseFromString(xml, "image/svg+xml");
      canvas.find("svg").remove();
      canvas.append(svg.documentElement);
      isEdit = false; //変更反映済み
    }
    return xml;
  }
});
