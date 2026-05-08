const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

function setupDom() {
  const dom = new JSDOM(`
    <!doctype html>
    <html>
      <body>
        <div id="sidebar" style="display:none"></div>
        <form id="product-form"></form>
        <table id="product-table">
          <thead>
            <tr>
              <th aria-sort="none"><button type="button" id="sort-button"></button></th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
        <input id="searchInput" />
        <button id="submitBtn" data-mode="add"></button>
        <input id="product-id" />
        <input id="product-name" />
        <input id="product-desc" />
        <input id="product-cat" />
        <input id="product-price" />
        <input id="product-sold" />
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

function loadProductsModule() {
  const modulePath = require.resolve("../products.js");
  delete require.cache[modulePath];
  return require("../products.js");
}

module.exports = [
  {
    name: "products page initializes default data and renders rows",
    fn() {
      setupDom();
      const productsModule = loadProductsModule();

      productsModule.initializeProductsPage();

      assert.ok(JSON.parse(localStorage.getItem("bizTrackProducts")).length > 0);
      assert.ok(document.querySelectorAll("#tableBody tr").length > 0);

      cleanupDom();
    },
  },
  {
    name: "products duplicate detection and add flow work",
    fn() {
      setupDom();
      const productsModule = loadProductsModule();

      productsModule.setProductsState([
        { prodID: "PD001", prodName: "Cap", prodDesc: "desc", prodCat: "Hats", prodPrice: 10, prodSold: 1 },
      ]);
      productsModule.renderProducts(productsModule.getProductsState());

      assert.equal(productsModule.isDuplicateID("PD001", null), true);
      assert.equal(productsModule.isDuplicateID("PD002", null), false);

      document.getElementById("product-id").value = "PD002";
      document.getElementById("product-name").value = "Bottle";
      document.getElementById("product-desc").value = "desc";
      document.getElementById("product-cat").value = "Drinkware";
      document.getElementById("product-price").value = "12.5";
      document.getElementById("product-sold").value = "2";

      productsModule.newProduct({ preventDefault() {} });

      assert.equal(productsModule.getProductsState().length, 2);
      assert.equal(JSON.parse(localStorage.getItem("bizTrackProducts")).length, 2);

      cleanupDom();
    },
  },
  {
    name: "products edit update delete and search flows work",
    fn() {
      setupDom();
      const productsModule = loadProductsModule();

      productsModule.setProductsState([
        { prodID: "PD001", prodName: "Cap", prodDesc: "desc", prodCat: "Hats", prodPrice: 10, prodSold: 1 },
      ]);
      productsModule.renderProducts(productsModule.getProductsState());

      productsModule.editRow("PD001");
      assert.equal(document.getElementById("product-id").value, "PD001");
      assert.equal(document.getElementById("submitBtn").dataset.mode, "update");

      document.getElementById("product-name").value = "Updated";
      productsModule.updateProduct("PD001");
      assert.equal(productsModule.getProductsState()[0].prodName, "Updated");

      document.getElementById("searchInput").value = "updated";
      productsModule.performSearch();
      assert.equal(document.querySelector(".product-row").style.display, "table-row");

      productsModule.deleteProduct("PD001");
      assert.equal(productsModule.getProductsState().length, 0);

      cleanupDom();
    },
  },
  {
    name: "products sort and export helpers run correctly",
    fn() {
      setupDom();
      const productsModule = loadProductsModule();

      productsModule.setProductsState([
        { prodID: "PD002", prodName: "B", prodDesc: "desc", prodCat: "Drinkware", prodPrice: 20, prodSold: 1 },
        { prodID: "PD001", prodName: "A", prodDesc: "desc", prodCat: "Hats", prodPrice: 10, prodSold: 2 },
      ]);
      productsModule.renderProducts(productsModule.getProductsState());

      const headerButton = document.getElementById("sort-button");
      productsModule.sortTable("prodID", headerButton);
      assert.equal(document.querySelector("#tableBody tr").dataset.prodid || document.querySelector("#tableBody tr").dataset.prodID, "PD001");

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

      assert.doesNotThrow(() => productsModule.exportToCSV());

      window.URL.createObjectURL = originalCreateObjectURL;
      document.createElement = originalCreateElement;
      cleanupDom();
    },
  },
];
