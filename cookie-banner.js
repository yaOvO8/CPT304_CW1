const cookieConsentStorageKey = "bizTrackCookieConsent";

function getCookieConsentValue() {
  return localStorage.getItem(cookieConsentStorageKey);
}

function setCookieConsentValue(value) {
  localStorage.setItem(cookieConsentStorageKey, value);
}

function closeCookieBanner() {
  const banner = document.getElementById("cookie-banner");

  if (!banner) {
    return;
  }

  banner.setAttribute("hidden", "");
}

function showCookieBanner() {
  const banner = document.getElementById("cookie-banner");

  if (banner) {
    banner.removeAttribute("hidden");
    return;
  }

  createCookieBanner();
}

function handleCookieConsent(value) {
  setCookieConsentValue(value);
  closeCookieBanner();
}

function createCookieBanner() {
  const banner = document.createElement("section");
  banner.id = "cookie-banner";
  banner.className = "cookie-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-live", "polite");
  banner.setAttribute("aria-label", window.t ? t("cookie.ariaLabel") : "Cookie notice");

  banner.innerHTML = `
    <div class="cookie-banner__content">
      <h2 id="cookie-banner-title">${window.t ? t("cookie.title") : "We use browser storage to keep BizTrack working."}</h2>
      <p>${window.t ? t("cookie.body") : 'BizTrack stores your products, orders, expenses, and this choice in your browser. Read our <a href="./privacy.html">Privacy Policy</a> for details.'}</p>
    </div>
    <div class="cookie-banner__actions">
      <button type="button" class="download-button" id="accept-cookies-btn">${window.t ? t("cookie.accept") : "Accept"}</button>
      <button type="button" class="btn cookie-banner__secondary" id="dismiss-cookies-btn">${window.t ? t("cookie.dismiss") : "Dismiss"}</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById("accept-cookies-btn").addEventListener("click", function () {
    handleCookieConsent("accepted");
  });

  document.getElementById("dismiss-cookies-btn").addEventListener("click", function () {
    handleCookieConsent("dismissed");
  });
}

function rerenderCookieBanner() {
  const banner = document.getElementById("cookie-banner");

  if (!banner) {
    return;
  }

  banner.setAttribute("aria-label", window.t ? t("cookie.ariaLabel") : "Cookie notice");
  const title = banner.querySelector("#cookie-banner-title");
  const body = banner.querySelector(".cookie-banner__content p");
  const accept = banner.querySelector("#accept-cookies-btn");
  const dismiss = banner.querySelector("#dismiss-cookies-btn");

  if (title) {
    title.textContent = window.t ? t("cookie.title") : title.textContent;
  }

  if (body) {
    body.innerHTML = window.t ? t("cookie.body") : body.innerHTML;
  }

  if (accept) {
    accept.textContent = window.t ? t("cookie.accept") : accept.textContent;
  }

  if (dismiss) {
    dismiss.textContent = window.t ? t("cookie.dismiss") : dismiss.textContent;
  }
}

function initializeCookieBanner() {
  if (getCookieConsentValue()) {
    return;
  }

  createCookieBanner();
}

function resetCookieConsent() {
  localStorage.removeItem(cookieConsentStorageKey);
  showCookieBanner();
}

document.addEventListener("DOMContentLoaded", initializeCookieBanner);
document.addEventListener("biztrack:languagechange", rerenderCookieBanner);

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    cookieConsentStorageKey,
    getCookieConsentValue,
    setCookieConsentValue,
    closeCookieBanner,
    showCookieBanner,
    handleCookieConsent,
    createCookieBanner,
    rerenderCookieBanner,
    initializeCookieBanner,
    resetCookieConsent,
  };
}
