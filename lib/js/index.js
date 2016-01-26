// index.js
"use strict";
const ko = require("knockout");
const Viz = require("./lib/js/Viz.js");
const App = require("./lib/js/App.js");
const viz = new Viz();
const parser = new DOMParser();
let app = null;
let source = "";

window.addEventListener("load", () => {
  app = new App();

  app.editor = CodeMirror.fromTextArea(
    document.getElementById("code"),
    {
      mode: "javascript",
      theme: "zenburn",
      lineNumbers: true
    }
  );
  app.callRefresh = refresh;

  ko.applyBindings(app);
  app.load();

  const code = `
digraph G {

	subgraph cluster_0 {
		style=filled;
		color=lightgrey;
		node [style=filled,color=white];
		a0 -> a1 -> a2 -> a3;
		label = "process #1";
	}

	subgraph cluster_1 {
		node [style=filled];
		b0 -> b1 -> b2 -> b3;
		label = "process #2";
		color=blue
	}
	start -> a0;
	start -> b0;
	a1 -> b3;
	b2 -> a3;
	a3 -> a0;
	a3 -> end;
	b3 -> end;

	start [shape=Mdiamond];
	end [shape=Msquare];
}
`;
  app.editor.setValue(code);

  setTimeout(function(){
    refresh();
  }, 100);

  $e("refresh").addEventListener("click", () => {
    refresh(true);
  });

  $e("saveSvg").addEventListener("click", () => {
    const filepath = viz.save(app.current(), (file) => {
      console.log(`save: ${file}.`);
    });
  });

  $e("savePng").addEventListener("click", () => {
    const image = viz.toPNG(app.current(), (file) => {
      console.log(`output: ${file}.`);
    });
  });
});

function $e(id) {
  return document.getElementById(id);
}

function refresh(force) {
  const data = app.editor.getValue();
  if (source !== data || force) {
    const $preview = $e("preview");
    const $svg = $preview.querySelector("svg");
    if ($svg) {
      $preview.removeChild($svg);
    }

    const xml = viz.parse(data);
    const svg = parser.parseFromString(xml, "image/svg+xml");
    $preview.appendChild(svg.documentElement);

    source = data;
  }
}
