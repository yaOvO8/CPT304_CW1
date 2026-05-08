const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

function setupDom() {
  const dom = new JSDOM(`
    <!doctype html>
    <html>
      <body>
        <div id="sidebar" style="display:none"></div>
        <form id="transaction-form"></form>
        <table id="finance-table">
          <thead>
            <tr>
              <th aria-sort="none"><button type="button" id="sort-button"></button></th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
        <input id="searchInput" />
        <button id="submitBtn" data-mode="add"></button>
        <input id="tr-id" />
        <input id="tr-date" />
        <input id="tr-category" />
        <input id="tr-amount" />
        <input id="tr-notes" />
        <div id="total-expenses"></div>
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
  global.showStatusMessage = function () {};
  global.clearStatusMessage = function () {};
  window.__BIZTRACK_DISABLE_AUTO_INIT__ = true;
}

function cleanupDom() {
  delete global.window;
  delete global.document;
  delete global.localStorage;
  delete global.bizTrackCore;
  delete global.t;
  delete global.formatCurrency;
  delete global.translateDynamicValue;
  delete global.showStatusMessage;
  delete global.clearStatusMessage;
}

function loadFinancesModule() {
  const modulePath = require.resolve("../finances.js");
  delete require.cache[modulePath];
  return require("../finances.js");
}

module.exports = [
  {
    name: "finances page initializes default data and renders rows",
    fn() {
      setupDom();
      const financesModule = loadFinancesModule();

      financesModule.initializeFinancesPage();

      assert.ok(JSON.parse(localStorage.getItem("bizTrackTransactions")).length > 0);
      assert.ok(document.querySelectorAll("#tableBody tr").length > 0);

      cleanupDom();
    },
  },
  {
    name: "finances add edit update delete and search flows work",
    fn() {
      setupDom();
      const financesModule = loadFinancesModule();

      financesModule.setTransactionsState([
        { trID: 1, trDate: "2024-01-01", trCategory: "Rent", trAmount: 50, trNotes: "note" },
      ]);
      financesModule.renderTransactions(financesModule.getTransactionsState());

      document.getElementById("tr-date").value = "2024-01-02";
      document.getElementById("tr-category").value = "Supplies";
      document.getElementById("tr-amount").value = "25";
      document.getElementById("tr-notes").value = "new note";

      financesModule.newTransaction({ preventDefault() {} });
      assert.equal(financesModule.getTransactionsState().length, 2);

      financesModule.editRow(2);
      assert.equal(document.getElementById("submitBtn").dataset.mode, "update");

      document.getElementById("tr-category").value = "Utilities";
      financesModule.updateTransaction(2);
      assert.equal(financesModule.getTransactionsState().find(tr => tr.trID === 2).trCategory, "Utilities");

      document.getElementById("searchInput").value = "utilities";
      financesModule.performSearch();
      assert.equal(document.querySelectorAll(".transaction-row")[1].style.display, "table-row");

      financesModule.deleteTransaction(2);
      assert.equal(financesModule.getTransactionsState().length, 1);

      cleanupDom();
    },
  },
  {
    name: "finances sort and export helpers run correctly",
    fn() {
      setupDom();
      const financesModule = loadFinancesModule();

      financesModule.setTransactionsState([
        { trID: 2, trDate: "2024-01-02", trCategory: "B", trAmount: 20, trNotes: "b" },
        { trID: 1, trDate: "2024-01-01", trCategory: "A", trAmount: 10, trNotes: "a" },
      ]);
      financesModule.renderTransactions(financesModule.getTransactionsState());

      financesModule.sortTable("trID", document.getElementById("sort-button"));
      assert.equal(document.querySelector("#tableBody tr").dataset.trid || document.querySelector("#tableBody tr").dataset.trID, "1");

      const originalCreateObjectURL = window.URL.createObjectURL;
      const originalCreateElement = document.createElement.bind(document);
      window.URL.createObjectURL = function () {
        return "blob:mock";
      };
      document.createElement = function (tagName) {
        const element = originalCreateElement(tagName);
        if (String(tagName).toLowerCase() === "a") {
          element.click = function () {};
        }
        return element;
      };

      assert.doesNotThrow(() => financesModule.exportToCSV());

      window.URL.createObjectURL = originalCreateObjectURL;
      document.createElement = originalCreateElement;
      cleanupDom();
    },
  },
];
