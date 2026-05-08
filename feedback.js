let feedbackClearTimer = null;

function showStatusMessage(message, type = "success") {
  const region = document.getElementById("action-feedback");

  if (!region) {
    return;
  }

  const isError = type === "error";

  clearTimeout(feedbackClearTimer);

  region.classList.remove("is-success", "is-error");
  region.textContent = message;
  region.classList.add(isError ? "is-error" : "is-success");
  region.setAttribute("role", isError ? "alert" : "status");
  region.setAttribute("aria-live", isError ? "assertive" : "polite");
  region.setAttribute("aria-atomic", "true");

  feedbackClearTimer = setTimeout(clearStatusMessage, 4500);
}

function clearStatusMessage() {
  const region = document.getElementById("action-feedback");

  if (!region) {
    return;
  }

  region.textContent = "";
  region.classList.remove("is-success", "is-error");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    showStatusMessage,
    clearStatusMessage,
  };
}
