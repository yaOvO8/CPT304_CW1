const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

function setupDom() {
  const dom = new JSDOM(`
    <!doctype html>
    <html>
      <body>
        <div id="sidebar" style="display:none"></div>
      </body>
    </html>
  `);

  global.window = dom.window;
  global.document = dom.window.document;
}

function cleanupDom() {
  delete global.window;
  delete global.document;
}

module.exports = [
  {
    name: "help sidebar toggles open and closed",
    fn() {
      setupDom();
      delete require.cache[require.resolve("../help.js")];
      const { openSidebar, closeSidebar } = require("../help.js");

      openSidebar();
      assert.equal(document.getElementById("sidebar").style.display, "block");

      closeSidebar();
      assert.equal(document.getElementById("sidebar").style.display, "none");

      cleanupDom();
    },
  },
];
