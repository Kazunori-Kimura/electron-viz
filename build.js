// build.js
"use strict";
const packager = require("electron-packager");
const config = require("./package.json");
const electron = require("./node_modules/electron-prebuilt/package.json");
const co = require("co");
const fs = require("fs-extra-promise");
// all, linux, win32, darwin
const targetPlatform = process.argv[2] || "win32";
// 64bit:x64, 32bit:ia32, all
const targetArch = process.argv[3] || "x64";

co(function*(){
  // 出力先を削除
  yield fs.removeAsync("./bin");
  // パッケージ作成
  yield pack();
  
  console.log("done!");
}).catch((err) => {
  console.error(err);
});

function pack(){
  return new Promise((resolve, reject) => {
    packager({
      dir: "./",          // 対象
      out: "./bin",      // 出力先
      name: config.name,  // 名前
      platform: targetPlatform, // all, linux, win32, darwin
      arch: targetArch,        // 64bit:x64, 32bit:ia32, all
      version: electron.version,  // electron のバージョン
      "app-bundle-id": "io.github.kazunori-kimura",
      "app-version": config.version,          // バージョン
      overwrite: true,  // 上書き
      asar: true,       // アーカイブ
      prune: true,
      // 無視ファイル
      ignore: "node_modules/(electron-packager|electron-prebuilt|\.bin)|build\.js|bin/electron-viz-*",
    }, function done (err, appPath) {
      if (err) {
        reject(err);
      }
      resolve(appPath);
    });
  });
}

