const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

const nativeSetTimeout = global.setTimeout;
const nativeClearTimeout = global.clearTimeout;

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.t = (key) => `translated:${key}`;
  window.t = global.t;
  global.setTimeout = nativeSetTimeout;
  global.clearTimeout = nativeClearTimeout;
}

function cleanupDom() {
  delete global.window;
  delete global.document;
  delete global.localStorage;
  delete global.t;
  global.setTimeout = nativeSetTimeout;
  global.clearTimeout = nativeClearTimeout;
}

function loadCookieModule() {
  const modulePath = require.resolve("../cookie-banner.js");
  delete require.cache[modulePath];
  const originalAddEventListener = document.addEventListener.bind(document);
  const blockedEvents = new Map();

  document.addEventListener = (type, listener, options) => {
    if (type === "DOMContentLoaded" || type === "biztrack:languagechange") {
      blockedEvents.set(type, listener);
      return;
    }

    return originalAddEventListener(type, listener, options);
  };

  const loadedModule = require("../cookie-banner.js");
  document.addEventListener = originalAddEventListener;
  loadedModule.__blockedEvents = blockedEvents;
  return loadedModule;
}

module.exports = [
  {
    name: "cookie consent value can be stored and read",
    fn() {
      installDom();
      const { setCookieConsentValue, getCookieConsentValue } = loadCookieModule();

      setCookieConsentValue("accepted");
      assert.equal(getCookieConsentValue(), "accepted");

      cleanupDom();
    },
  },
  {
    name: "createCookieBanner renders an accessible banner",
    fn() {
      installDom();
      const { createCookieBanner } = loadCookieModule();

      createCookieBanner();

      const banner = document.getElementById("cookie-banner");
      assert.ok(banner);
      assert.equal(banner.getAttribute("role"), "region");
      assert.equal(banner.getAttribute("aria-live"), "polite");
      assert.equal(document.getElementById("accept-cookies-btn").textContent, "translated:cookie.accept");

      cleanupDom();
    },
  },
  {
    name: "createCookieBanner falls back to default text when translator is unavailable",
    fn() {
      installDom();
      delete global.t;
      delete window.t;
      const { createCookieBanner } = loadCookieModule();

      createCookieBanner();

      const banner = document.getElementById("cookie-banner");
      assert.equal(banner.getAttribute("aria-label"), "Cookie notice");
      assert.match(document.querySelector(".cookie-banner__content p").innerHTML, /Privacy Policy/);

      cleanupDom();
    },
  },
  {
    name: "createCookieBanner wires accept and dismiss buttons",
    fn() {
      installDom();
      const { createCookieBanner, getCookieConsentValue } = loadCookieModule();

      createCookieBanner();
      document.getElementById("accept-cookies-btn").click();
      assert.equal(getCookieConsentValue(), "accepted");

      document.getElementById("cookie-banner").removeAttribute("hidden");
      document.getElementById("dismiss-cookies-btn").click();
      assert.equal(getCookieConsentValue(), "dismissed");

      cleanupDom();
    },
  },
  {
    name: "handleCookieConsent stores consent and hides the banner",
    fn() {
      installDom();
      const { createCookieBanner, handleCookieConsent, getCookieConsentValue } = loadCookieModule();

      createCookieBanner();
      handleCookieConsent("dismissed");

      const banner = document.getElementById("cookie-banner");
      assert.equal(getCookieConsentValue(), "dismissed");
      assert.equal(banner.hasAttribute("hidden"), true);

      cleanupDom();
    },
  },
  {
    name: "showCookieBanner reveals an existing hidden banner",
    fn() {
      installDom();
      const { createCookieBanner, closeCookieBanner, showCookieBanner } = loadCookieModule();

      createCookieBanner();
      closeCookieBanner();
      showCookieBanner();

      assert.equal(document.getElementById("cookie-banner").hasAttribute("hidden"), false);

      cleanupDom();
    },
  },
  {
    name: "showCookieBanner creates a banner when one does not exist",
    fn() {
      installDom();
      const { showCookieBanner } = loadCookieModule();

      showCookieBanner();

      assert.ok(document.getElementById("cookie-banner"));

      cleanupDom();
    },
  },
  {
    name: "rerenderCookieBanner updates translated content",
    fn() {
      installDom();
      const { createCookieBanner, rerenderCookieBanner } = loadCookieModule();

      createCookieBanner();
      global.t = (key) => `updated:${key}`;
      window.t = global.t;

      rerenderCookieBanner();

      const banner = document.getElementById("cookie-banner");
      assert.equal(banner.getAttribute("aria-label"), "updated:cookie.ariaLabel");
      assert.equal(document.getElementById("cookie-banner-title").textContent, "updated:cookie.title");
      assert.match(document.querySelector(".cookie-banner__content p").innerHTML, /updated:cookie.body/);

      cleanupDom();
    },
  },
  {
    name: "rerenderCookieBanner preserves content when translator is unavailable",
    fn() {
      installDom();
      const { createCookieBanner, rerenderCookieBanner } = loadCookieModule();

      createCookieBanner();
      const previousBody = document.querySelector(".cookie-banner__content p").innerHTML;
      delete global.t;
      delete window.t;

      rerenderCookieBanner();

      const banner = document.getElementById("cookie-banner");
      assert.equal(banner.getAttribute("aria-label"), "Cookie notice");
      assert.equal(document.querySelector(".cookie-banner__content p").innerHTML, previousBody);

      cleanupDom();
    },
  },
  {
    name: "initializeCookieBanner only renders when consent is missing",
    fn() {
      installDom();
      const { initializeCookieBanner, setCookieConsentValue, __blockedEvents } = loadCookieModule();

      initializeCookieBanner();
      assert.ok(document.getElementById("cookie-banner"));

      document.body.innerHTML = "";
      setCookieConsentValue("accepted");
      initializeCookieBanner();
      assert.equal(document.getElementById("cookie-banner"), null);
      assert.equal(typeof __blockedEvents.get("DOMContentLoaded"), "function");

      cleanupDom();
    },
  },
  {
    name: "rerenderCookieBanner exits safely when no banner exists",
    fn() {
      installDom();
      const { rerenderCookieBanner } = loadCookieModule();

      assert.doesNotThrow(() => rerenderCookieBanner());

      cleanupDom();
    },
  },
  {
    name: "resetCookieConsent clears stored consent and shows the banner again",
    fn() {
      installDom();
      const { setCookieConsentValue, resetCookieConsent, getCookieConsentValue } = loadCookieModule();

      setCookieConsentValue("accepted");
      resetCookieConsent();

      assert.equal(getCookieConsentValue(), null);
      assert.ok(document.getElementById("cookie-banner"));

      cleanupDom();
    },
  },
  {
    name: "closeCookieBanner exits safely even when no banner exists",
    fn() {
      installDom();
      const { closeCookieBanner } = loadCookieModule();

      assert.doesNotThrow(() => closeCookieBanner());

      cleanupDom();
    },
  },
];
