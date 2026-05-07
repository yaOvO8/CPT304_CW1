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
  banner.setAttribute("aria-label", "Cookie notice");

  banner.innerHTML = `
    <div class="cookie-banner__content">
      <h2 id="cookie-banner-title">We use browser storage to keep BizTrack working.</h2>
      <p>
        BizTrack stores your products, orders, expenses, and this choice in your browser.
        Read our <a href="./privacy.html">Privacy Policy</a> for details.
      </p>
    </div>
    <div class="cookie-banner__actions">
      <button type="button" class="download-button" id="accept-cookies-btn">Accept</button>
      <button type="button" class="btn cookie-banner__secondary" id="dismiss-cookies-btn">Dismiss</button>
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
