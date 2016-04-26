"use strict";
const fs = require("electron").remote.require("fs-extra-promise");
const dialog = require("@kazunori-kimura/electron-dialog-promise");
const myUtil = require("./my-util.js");
const co = require("co");
const viz = require("viz.js");
const parser = new DOMParser();
const keys = require("./keycode.json");
const Msg = require("./message");

$(function(){
  let timer = 0;
  let isEdit = false;

  /**
   * 表示されているSVGの元サイズ
   * @type {object}
   */
  const svgSize = { "width": 100, "height": 100 };

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
    }).catch((err) => {
      const msg = new Msg("error", err.message);
      msg.show();
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
      const msg = new Msg("error", err.message);
      msg.show();
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
      const msg = new Msg("success", `DOTファイルを保存しました: ${filePath}`, 3000);
      msg.show();
    }).catch((err) => {
      const msg = new Msg("error", err.message);
      msg.show();
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

      // save dot file
      const data = editor.getValue();
      if (!(typeof data == "string" && data.length > 0)) {
        return;
      }
      const svg = updatePreview(data);
      if (svg) {
        // save svg file
        yield fs.outputFileAsync(svgFilePath, svg, "utf8");
        const msg = new Msg("success", `SVGファイルを保存しました: ${svgFilePath}`, 3000);
        msg.show();
      }
    }).catch((err) => {
      const msg = new Msg("error", err.message);
      msg.show();
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

    const msg = new Msg("info", `自動更新: ${$(ev.target).hasClass("active") ? "ON" : "OFF"}`, 3000);
    msg.show();
  });

  // zoom rate
  $("#zoomRateList a").on("click", (ev) => {
    const rawRate = $(ev.target).text();
    $("#zoomRate").text(rawRate);

    // zoom処理
    zoomSVG(rawRate);
  });

  /**
   * preview更新
   * @param {string} dot - dotの元データ
   * @param {object} canvas - svgを追加するjqueryオブジェクト
   * @returns {string} dotから生成されたsvg
   */
  function updatePreview(dot, canvas){
    // parse dot -> svg
    if (dot == "") {
      isEdit = false; //変更反映済み
      return undefined;
    }
    try {
      const xml = viz(dot, { format: "svg", engine: "dot" });
      // canvas に svgタグをappend
      if (xml && canvas) {
        const svg = parser.parseFromString(xml, "image/svg+xml");
        canvas.find("svg").remove();
        canvas.append(svg.documentElement);
        isEdit = false; //変更反映済み

        // svgのサイズを保持する
        const $svg = $("svg");
        if ($svg.length === 1) {
          const rawWidth = $svg.attr("width");
          const rawHeight = $svg.attr("height");
          svgSize.width = rawWidth ? parseInt(rawWidth.replace("pt", ""), 10) : 100;
          svgSize.height = rawHeight ? parseInt(rawHeight.replace("pt", ""), 10) : 100;

          // 指定された比率に width/height を更新
          zoomSVG($("#zoomRate").text());
        } else {
          return undefined;
        }
      }
      return xml;
    } catch(err) {
      isEdit = false; //変更反映済み
      return undefined;
    }
  }

  /**
   * svgの表示サイズを指定された比率に変更する
   * @param {string} rawRate - 50%, 75%, 100%, 125%, 150% のいずれか
   */
  function zoomSVG(rawRate){
    const $svg = $("svg");
    if ($svg.length === 1) {
      const rate = parseInt(rawRate.replace("%", ""), 10) / 100;

      $svg.attr("width", `${svgSize.width * rate}pt`);
      $svg.attr("height", `${svgSize.height * rate}pt`);
    }
  }

  // ショートカットキーの設定
  $(window).on("keydown", (ev) => {
    if (ev.ctrlKey || ev.metaKey) {
      switch(ev.keyCode) {
        case keys.N:
          $("#btnNew").click();
          return false;
        case keys.O:
          $("#btnOpen").click();
          return false;
        case keys.P:
          $("#btnPreview").click();
          return false;
        case keys.S:
          $("#btnSave").click();
          return false;
        case keys.Enter:
          $("#btnExport").click();
          return false;
      }
    }
    return true;
  });

  // デフォルトでauto previewをonにする
  $("#btnSync").click();
});
