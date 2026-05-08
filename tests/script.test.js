const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

function setupDom() {
  const dom = new JSDOM(`
    <!doctype html>
    <html>
      <body>
        <div id="sidebar" style="display:none"></div>
        <div id="rev-amount"></div>
        <div id="exp-amount"></div>
        <div id="balance"></div>
        <div id="num-orders"></div>
        <div id="bar-chart"></div>
        <div id="donut-chart"></div>
      </body>
    </html>
  `, { url: "http://localhost/" });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.bizTrackCore = require("../biztrack-core.js");
  global.t = (key) => key;
  global.formatCurrency = (value) => `$${Number(value).toFixed(2)}`;
  global.translateDynamicValue = (_, value) => value;
  global.ApexCharts = function () {
    this.render = function () {};
  };
}

function cleanupDom() {
  if (global.window) {
    global.window.onload = null;
  }
  delete global.window;
  delete global.document;
  delete global.localStorage;
  delete global.bizTrackCore;
  delete global.t;
  delete global.formatCurrency;
  delete global.translateDynamicValue;
  delete global.ApexCharts;
}

module.exports = [
  {
    name: "dashboard sidebar toggles open and closed",
    fn() {
      setupDom();
      delete require.cache[require.resolve("../script.js")];
      const { openSidebar, closeSidebar } = require("../script.js");

      openSidebar();
      assert.equal(document.getElementById("sidebar").style.display, "block");

      closeSidebar();
      assert.equal(document.getElementById("sidebar").style.display, "none");

      cleanupDom();
    },
  },
  {
    name: "dashboard summary renders totals from localStorage",
    fn() {
      setupDom();
      localStorage.setItem("bizTrackTransactions", JSON.stringify([{ trAmount: 50 }]));
      localStorage.setItem("bizTrackOrders", JSON.stringify([{ orderTotal: 120 }, { orderTotal: 30 }]));
      delete require.cache[require.resolve("../script.js")];
      const { renderDashboardSummary } = require("../script.js");

      renderDashboardSummary();

      assert.match(document.getElementById("rev-amount").textContent, /150\.00/);
      assert.match(document.getElementById("exp-amount").textContent, /50\.00/);
      assert.match(document.getElementById("balance").textContent, /100\.00/);
      assert.match(document.getElementById("num-orders").textContent, /2/);

      cleanupDom();
    },
  },
  {
    name: "dashboard chart initialization renders charts",
    fn() {
      setupDom();
      localStorage.setItem("bizTrackProducts", JSON.stringify([
        { prodCat: "Hats", prodPrice: 10, prodSold: 2 },
      ]));
      localStorage.setItem("bizTrackTransactions", JSON.stringify([
        { trCategory: "Rent", trAmount: 50 },
      ]));
      delete require.cache[require.resolve("../script.js")];
      const { initializeChart } = require("../script.js");

      assert.doesNotThrow(() => initializeChart());

      cleanupDom();
    },
  },
];
