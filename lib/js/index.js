// index.js
"use strict";
const ko = require("knockout");
const Viz = require("./lib/js/Viz.js");
const App = require("./lib/js/App.js");
const viz = new Viz();
const parser = new DOMParser();
let editor = null;
let image = null;

function $e(id) {
  return document.getElementById(id);
}

window.addEventListener("load", () => {
  editor = CodeMirror.fromTextArea(
    document.getElementById("code"),
    {
      mode: "javascript",
      theme: "zenburn",
      lineNumbers: true
    }
  );

  const app = new App();
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
  editor.setValue(code);

  setTimeout(function(){
    refresh();
  }, 100);

  $e("refresh").addEventListener("click", () => {
    refresh();
  });

  $e("saveSvg").addEventListener("click", () => {
    viz.save();
  });

  $e("savePng").addEventListener("click", () => {
    image = viz.toPNG(() => {
      console.log("output png.");
    });
  });
});

function refresh() {
  const $preview = $e("preview");
  const $svg = $preview.querySelector("svg");
  if ($svg) {
    $preview.removeChild($svg);
  }

  const data = editor.getValue();
  const xml = viz.parse(data);
  const svg = parser.parseFromString(xml, "image/svg+xml");
  $preview.appendChild(svg.documentElement);
}
