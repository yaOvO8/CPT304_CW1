const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

function setupDom(options = {}) {
  const { disableAutoInit = true } = options;
  const dom = new JSDOM(`
    <!doctype html>
    <html>
      <body data-page-title-key="titles.dashboard">
        <button id="language-toggle" aria-expanded="false"></button>
        <div id="language-menu">
          <button data-language-option="en"></button>
          <button data-language-option="zh"></button>
        </div>
        <span id="current-language-code"></span>
        <span data-i18n="common.add"></span>
        <input data-i18n-placeholder="common.search" />
      </body>
    </html>
  `, { url: "http://localhost/" });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.CustomEvent = dom.window.CustomEvent;
  globalThis.CustomEvent = dom.window.CustomEvent;
  if (disableAutoInit) {
    window.__BIZTRACK_DISABLE_AUTO_INIT__ = true;
  } else {
    delete window.__BIZTRACK_DISABLE_AUTO_INIT__;
  }
}

function cleanupDom() {
  if (global.window) {
    global.window.__BIZTRACK_DISABLE_AUTO_INIT__ = false;
  }
  delete global.window;
  delete global.document;
  delete global.localStorage;
  delete global.CustomEvent;
  delete globalThis.CustomEvent;
}

function setupInteractiveDom(options = {}) {
  const { disableAutoInit = true } = options;
  const dom = new JSDOM(`
    <!doctype html>
    <html>
      <body data-page-title-key="titles.products">
        <button id="language-toggle" aria-expanded="false"></button>
        <div id="language-menu">
          <button data-language-option="en"></button>
          <button data-language-option="fr"></button>
        </div>
        <span id="current-language-code"></span>
        <span data-i18n="common.add"></span>
        <div data-i18n-html="cookie.body"></div>
        <button data-i18n-aria-label="common.closeSidebar"></button>
        <input data-i18n-label="common.search" />
      </body>
    </html>
  `, { url: "http://localhost/" });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  if (disableAutoInit) {
    window.__BIZTRACK_DISABLE_AUTO_INIT__ = true;
  } else {
    delete window.__BIZTRACK_DISABLE_AUTO_INIT__;
  }
}

function loadI18nModule() {
  const modulePath = require.resolve("../i18n.js");
  delete require.cache[modulePath];
  return require("../i18n.js");
}

module.exports = [
  {
    name: "i18n helper functions resolve translations and fallbacks",
    fn() {
      setupDom();
      const i18n = loadI18nModule();

      assert.equal(i18n.getCurrentLanguage(), "en");
      assert.equal(i18n.getTranslationValue("common.add", "en"), "Add");
      assert.equal(i18n.getTranslationValue("missing.key", "en"), "missing.key");
      assert.equal(i18n.templateFor("common.add"), "Add");
      assert.equal(i18n.t("products.msg.added", { id: "PD001" }), "Product PD001 added successfully.");
      assert.equal(i18n.translateDynamicValue("status", "Pending"), "Pending");

      cleanupDom();
    },
  },
  {
    name: "i18n reads defaults and applies translations",
    fn() {
      setupDom();
      const i18n = loadI18nModule();

      i18n.applyTranslations();
      assert.equal(document.documentElement.lang, "en");
      assert.equal(document.title, "Dashboard - BizTrack");
      assert.equal(document.getElementById("current-language-code").textContent, "EN");
      assert.equal(document.querySelector("[data-i18n='common.add']").textContent, "Add");
      assert.equal(document.querySelector("[data-i18n-placeholder='common.search']").getAttribute("placeholder"), "Search");

      cleanupDom();
    },
  },
  {
    name: "i18n can switch languages and interpolate values",
    fn() {
      setupDom();
      const i18n = loadI18nModule();

      assert.equal(i18n.interpolateTranslation("Hello {name}", { name: "BizTrack" }), "Hello BizTrack");
      const originalDispatchEvent = document.dispatchEvent.bind(document);
      document.dispatchEvent = function () {
        return true;
      };
      i18n.setLanguage("zh");
      assert.equal(localStorage.getItem("bizTrackLanguage"), "zh");
      document.dispatchEvent = originalDispatchEvent;

      cleanupDom();
    },
  },
  {
    name: "i18n language switcher initializes and responds to UI events",
    fn() {
      setupInteractiveDom({ disableAutoInit: false });
      const i18n = loadI18nModule();

      document.dispatchEvent(new window.Event("DOMContentLoaded"));

      assert.equal(document.documentElement.lang, "en");
      assert.equal(document.title, "Products - BizTrack");
      assert.equal(document.querySelector("[data-i18n='common.add']").textContent, "Add");
      assert.equal(document.querySelector("[data-i18n-html='cookie.body']").innerHTML.includes("Privacy Policy"), true);
      assert.equal(document.querySelector("[data-i18n-aria-label='common.closeSidebar']").getAttribute("aria-label"), "Close sidebar");
      assert.equal(document.querySelector("[data-i18n-label='common.search']").getAttribute("label"), "Search");
      assert.equal(document.querySelector("[data-language-option='en']").getAttribute("aria-pressed"), "true");
      assert.equal(document.querySelector("[data-language-option='fr']").getAttribute("aria-pressed"), "false");
      assert.equal(i18n.formatCurrency(12.5), "$12.50");
      assert.equal(i18n.translateDynamicValue("unknown", "fallback"), "fallback");
      assert.equal(i18n.getTranslationValue("common.add", "fr"), "Ajouter");

      const toggle = document.getElementById("language-toggle");
      const menu = document.getElementById("language-menu");

      toggle.click();
      assert.equal(menu.classList.contains("is-open"), true);
      assert.equal(toggle.getAttribute("aria-expanded"), "true");

      const originalDispatchEvent = document.dispatchEvent.bind(document);
      document.dispatchEvent = function () {
        return true;
      };

      document.querySelector("[data-language-option='fr']").click();
      assert.equal(localStorage.getItem("bizTrackLanguage"), "fr");
      assert.equal(menu.classList.contains("is-open"), false);
      assert.equal(toggle.getAttribute("aria-expanded"), "false");
      assert.equal(document.documentElement.lang, "fr");
      assert.equal(document.getElementById("current-language-code").textContent, "FR");

      document.dispatchEvent = originalDispatchEvent;

      toggle.click();
      document.body.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
      assert.equal(menu.classList.contains("is-open"), false);
      assert.equal(toggle.getAttribute("aria-expanded"), "false");

      document.removeEventListener("DOMContentLoaded", i18n.initializeLanguageSwitcher);
      cleanupDom();
    },
  },
  {
    name: "i18n falls back to default language and handles missing controls",
    fn() {
      setupDom();
      localStorage.setItem("bizTrackLanguage", "xx");
      document.body.innerHTML = "<span data-i18n=\"common.add\"></span>";
      const i18n = loadI18nModule();

      assert.equal(i18n.getCurrentLanguage(), "en");
      i18n.initializeLanguageSwitcher();
      assert.equal(document.querySelector("[data-i18n='common.add']").textContent, "Add");

      cleanupDom();
    },
  },
  {
    name: "i18n initializes safely when switcher controls are missing",
    fn() {
      setupDom();
      document.body.innerHTML = `
        <span data-i18n="common.add"></span>
        <input data-i18n-placeholder="common.search" />
        <div data-i18n-html="cookie.body"></div>
        <button data-i18n-aria-label="common.closeSidebar"></button>
        <input data-i18n-label="common.search" />
      `;

      const i18n = loadI18nModule();
      i18n.initializeLanguageSwitcher();

      assert.equal(document.querySelector("[data-i18n='common.add']").textContent, "Add");
      assert.equal(document.querySelector("[data-i18n-placeholder='common.search']").getAttribute("placeholder"), "Search");
      assert.equal(document.querySelector("[data-i18n-aria-label='common.closeSidebar']").getAttribute("aria-label"), "Close sidebar");
      assert.equal(document.querySelector("[data-i18n-label='common.search']").getAttribute("label"), "Search");

      cleanupDom();
    },
  },
];
