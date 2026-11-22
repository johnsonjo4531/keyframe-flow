// Local-preview shim for guide embeds and cross-surface links (T50/T58).
// Storybook iframe URLs in docs are protocol-relative and anchor links
// ("Open in Storybook", "▶ Vanilla TypeScript implementation") are absolute
// published-host URLs, so a locally served site would fetch them from
// production (404 until first deploy) instead of the locally built surfaces.
// On any origin other than johnsonjo4531.github.io — `make preview-site`,
// CI previews, mirrors — rewrite both to same-origin paths under
// /keyframe-flow/. On GitHub Pages itself this script is a no-op and links
// load from the published site.
(function () {
  var HOSTS = ["https://johnsonjo4531.github.io/", "//johnsonjo4531.github.io/"];
  if (location.host === "johnsonjo4531.github.io") return;

  function matchingHost(value) {
    for (var i = 0; i < HOSTS.length; i++) {
      if (value.indexOf(HOSTS[i]) === 0) return HOSTS[i];
    }
    return null;
  }

  var SELECTOR = ["iframe", "a"]
    .map(function (tag) {
      return tag + "[src], " + tag + "[data-src], " + tag + "[href]";
    })
    .join(", ");

  function rewrite(root) {
    var nodes =
      root.matches && root.matches(SELECTOR)
        ? [root].concat(Array.from(root.querySelectorAll(SELECTOR)))
        : Array.from(root.querySelectorAll(SELECTOR));
    for (var i = 0; i < nodes.length; i++) {
      ["src", "data-src", "href"].forEach(function (attr) {
        var value = nodes[i].getAttribute(attr);
        if (!value) return;
        var host = matchingHost(value);
        // Keep query strings and fragments: Storybook routes on ?path=… and
        // the gallery on #/example/<id>.
        if (host) nodes[i].setAttribute(attr, "/" + value.slice(host.length));
      });
    }
  }

  rewrite(document.documentElement);

  // Embed islands hydrate lazily and may insert/replace iframes after load —
  // catch anything added later.
  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var n = 0; n < added.length; n++) {
        if (added[n].nodeType === 1) rewrite(added[n]);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
