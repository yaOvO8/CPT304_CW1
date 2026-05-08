const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

function setupDom() {
  const dom = new JSDOM(`
    <!doctype html>
    <html>
      <body>
        <div id="sidebar" style="display:none"></div>
        <form id="order-form"></form>
        <table id="order-table">
          <thead>
            <tr>
              <th aria-sort="none"><button type="button" id="sort-button"></button></th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
        <input id="searchInput" />
        <button id="submitBtn" data-mode="add"></button>
        <input id="order-id" />
        <input id="order-date" />
        <input id="item-name" />
        <input id="item-price" />
        <input id="qty-bought" />
        <input id="shipping" />
        <input id="taxes" />
        <input id="order-total" />
        <input id="order-status" />
        <div id="total-revenue"></div>
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

function loadOrdersModule() {
  const modulePath = require.resolve("../orders.js");
  delete require.cache[modulePath];
  return require("../orders.js");
}

module.exports = [
  {
    name: "orders page initializes default data and renders rows",
    fn() {
      setupDom();
      const ordersModule = loadOrdersModule();

      ordersModule.initializeOrdersPage();

      assert.ok(JSON.parse(localStorage.getItem("bizTrackOrders")).length > 0);
      assert.ok(document.querySelectorAll("#tableBody tr").length > 0);

      cleanupDom();
    },
  },
  {
    name: "orders add edit update delete and search flows work",
    fn() {
      setupDom();
      const ordersModule = loadOrdersModule();

      ordersModule.setOrdersState([
        { orderID: "1001", orderDate: "2024-01-01", itemName: "Cap", itemPrice: 10, qtyBought: 2, shipping: 1, taxes: 1, orderTotal: 22, orderStatus: "Pending" },
      ]);
      ordersModule.renderOrders(ordersModule.getOrdersState());

      document.getElementById("order-id").value = "1002";
      document.getElementById("order-date").value = "2024-01-02";
      document.getElementById("item-name").value = "Bottle";
      document.getElementById("item-price").value = "12.5";
      document.getElementById("qty-bought").value = "2";
      document.getElementById("shipping").value = "1";
      document.getElementById("taxes").value = "1";
      document.getElementById("order-status").value = "Processing";

      ordersModule.newOrder({ preventDefault() {} });
      assert.equal(ordersModule.getOrdersState().length, 2);

      ordersModule.editRow("1002");
      assert.equal(document.getElementById("submitBtn").dataset.mode, "update");

      document.getElementById("item-name").value = "Bottle Updated";
      ordersModule.updateOrder("1002");
      assert.equal(ordersModule.getOrdersState().find(order => order.orderID === "1002").itemName, "Bottle Updated");

      document.getElementById("searchInput").value = "bottle";
      ordersModule.performSearch();
      assert.equal(document.querySelectorAll(".order-row")[1].style.display, "table-row");

      ordersModule.deleteOrder("1002");
      assert.equal(ordersModule.getOrdersState().length, 1);

      cleanupDom();
    },
  },
  {
    name: "orders sort and export helpers run correctly",
    fn() {
      setupDom();
      const ordersModule = loadOrdersModule();

      ordersModule.setOrdersState([
        { orderID: "1002", orderDate: "2024-01-02", itemName: "B", itemPrice: 20, qtyBought: 1, shipping: 1, taxes: 1, orderTotal: 22, orderStatus: "Pending" },
        { orderID: "1001", orderDate: "2024-01-01", itemName: "A", itemPrice: 10, qtyBought: 2, shipping: 1, taxes: 1, orderTotal: 22, orderStatus: "Delivered" },
      ]);
      ordersModule.renderOrders(ordersModule.getOrdersState());

      ordersModule.sortTable("orderID", document.getElementById("sort-button"));
      assert.equal(document.querySelector("#tableBody tr").dataset.orderid || document.querySelector("#tableBody tr").dataset.orderID, "1001");

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

      assert.doesNotThrow(() => ordersModule.exportToCSV());

      window.URL.createObjectURL = originalCreateObjectURL;
      document.createElement = originalCreateElement;
      cleanupDom();
    },
  },
];
