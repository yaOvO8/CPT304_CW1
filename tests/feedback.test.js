const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

const nativeSetTimeout = global.setTimeout;
const nativeClearTimeout = global.clearTimeout;

function installDom() {
  const dom = new JSDOM(`
    <!doctype html>
    <html>
      <body>
        <div id="action-feedback" role="status" aria-live="polite" aria-atomic="true"></div>
      </body>
    </html>
  `);

  global.window = dom.window;
  global.document = dom.window.document;
  global.setTimeout = () => 0;
  global.clearTimeout = () => {};
}

function cleanupDom() {
  delete global.window;
  delete global.document;
  global.setTimeout = nativeSetTimeout;
  global.clearTimeout = nativeClearTimeout;
}

function loadFeedbackModule() {
  const modulePath = require.resolve("../feedback.js");
  delete require.cache[modulePath];
  return require("../feedback.js");
}

module.exports = [
  {
    name: "showStatusMessage uses polite status semantics for success",
    fn() {
      installDom();
      const { showStatusMessage } = loadFeedbackModule();

      showStatusMessage("Saved successfully.");

      const region = document.getElementById("action-feedback");
      assert.equal(region.textContent, "Saved successfully.");
      assert.equal(region.classList.contains("is-success"), true);
      assert.equal(region.getAttribute("role"), "status");
      assert.equal(region.getAttribute("aria-live"), "polite");
      assert.equal(region.getAttribute("aria-atomic"), "true");

      cleanupDom();
    },
  },
  {
    name: "showStatusMessage uses alert semantics for errors",
    fn() {
      installDom();
      const { showStatusMessage } = loadFeedbackModule();

      showStatusMessage("Something failed.", "error");

      const region = document.getElementById("action-feedback");
      assert.equal(region.textContent, "Something failed.");
      assert.equal(region.classList.contains("is-error"), true);
      assert.equal(region.getAttribute("role"), "alert");
      assert.equal(region.getAttribute("aria-live"), "assertive");

      cleanupDom();
    },
  },
  {
    name: "clearStatusMessage resets the live region",
    fn() {
      installDom();
      const { showStatusMessage, clearStatusMessage } = loadFeedbackModule();

      showStatusMessage("Temporary message.");
      clearStatusMessage();

      const region = document.getElementById("action-feedback");
      assert.equal(region.textContent, "");
      assert.equal(region.classList.contains("is-success"), false);
      assert.equal(region.classList.contains("is-error"), false);
      assert.equal(region.getAttribute("role"), "status");
      assert.equal(region.getAttribute("aria-live"), "polite");

      cleanupDom();
    },
  },
  {
    name: "feedback helpers exit safely when the live region is missing",
    fn() {
      const dom = new JSDOM("<!doctype html><html><body></body></html>");
      global.window = dom.window;
      global.document = dom.window.document;
      const { showStatusMessage, clearStatusMessage } = loadFeedbackModule();

      assert.doesNotThrow(() => showStatusMessage("No target"));
      assert.doesNotThrow(() => clearStatusMessage());

      cleanupDom();
    },
  },
];
