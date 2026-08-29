(function (global) {
  "use strict";

  var script = document.currentScript;
  var scriptUrl = new URL(script && script.src ? script.src : "./embed.js", window.location.href);
  var baseUrl = script && script.dataset.base ? script.dataset.base.replace(/\/$/, "") : scriptUrl.origin;
  var embedOrigin = new URL(baseUrl, window.location.href).origin;

  var states = [
    "sleeping", "waking", "idle", "listening", "thinking", "searching", "working",
    "excited", "surprised", "suspicious", "angry", "drowsy", "happy", "curious",
    "confused", "bored", "proud", "shy", "sad", "laughing", "scared", "playful",
    "celebrate", "orbit", "radar", "progress", "spawning", "humming", "loading",
    "dictating", "writing", "sending", "receiving", "uploading", "notifying",
    "alerting", "dragging", "bouncing", "powering-down"
  ];
  var shapes = [
    "blob", "pebble", "bean", "egg", "squircle", "tablet", "capsule", "cylinder",
    "hex", "gem", "crystal", "wedge", "shield", "dome", "arch", "cloud",
    "teardrop", "leaf"
  ];

  function resolveTarget(target) {
    var element = typeof target === "string" ? document.querySelector(target) : target;
    if (!element || element.nodeType !== 1) throw new Error("GrokEmotion.mount: target element was not found");
    return element;
  }

  function sanitize(config) {
    config = config || {};
    return {
      state: states.indexOf(config.state) !== -1 ? config.state : "idle",
      shape: shapes.indexOf(config.shape) !== -1 ? config.shape : "blob",
      color: /^#[0-9a-f]{6}$/i.test(config.color || "") ? config.color : "#08a96f",
      eyes: /^#[0-9a-f]{6}$/i.test(config.eyes || "") ? config.eyes : "#08110d",
      size: Math.max(40, Math.min(800, Number(config.size) || 280)),
      autoCycle: config.autoCycle === true
    };
  }

  function mount(target, initialConfig) {
    var container = resolveTarget(target);
    var config = sanitize(initialConfig);
    var params = new URLSearchParams({
      embed: "1",
      state: config.state,
      shape: config.shape,
      color: config.color,
      eyes: config.eyes,
      size: String(config.size),
      auto: config.autoCycle ? "1" : "0"
    });
    var iframe = document.createElement("iframe");
    iframe.src = baseUrl + "/?" + params.toString();
    iframe.title = "Animated AI agent avatar";
    iframe.loading = "eager";
    iframe.style.display = "block";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    iframe.style.background = "transparent";
    iframe.setAttribute("allowtransparency", "true");
    container.replaceChildren(iframe);

    var ready = false;
    function send() {
      if (!ready || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage({ type: "grok-emotion:update", config: config }, embedOrigin);
    }
    function onMessage(event) {
      if (event.origin !== embedOrigin || event.source !== iframe.contentWindow) return;
      if (event.data && event.data.type === "grok-emotion:ready") {
        ready = true;
        send();
      }
    }
    window.addEventListener("message", onMessage);
    iframe.addEventListener("load", function () { ready = true; send(); });

    var controller = {
      iframe: iframe,
      getConfig: function () { return Object.assign({}, config); },
      update: function (next) {
        config = sanitize(Object.assign({}, config, next || {}));
        send();
        return controller;
      },
      setState: function (state) { return controller.update({ state: state, autoCycle: false }); },
      setShape: function (shape) { return controller.update({ shape: shape }); },
      setColor: function (color, eyes) { return controller.update({ color: color, eyes: eyes || config.eyes }); },
      replay: function () { send(); return controller; },
      destroy: function () {
        window.removeEventListener("message", onMessage);
        iframe.remove();
      }
    };
    return controller;
  }

  global.GrokEmotion = {
    version: "1.0.0",
    states: states.slice(),
    shapes: shapes.slice(),
    mount: mount
  };
})(window);
