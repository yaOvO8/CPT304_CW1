(function (globalScope) {
  function calculateExpTotal(transactions = []) {
    return transactions.reduce((total, transaction) => total + transaction.trAmount, 0);
  }

  function calculateRevTotal(orders = []) {
    return orders.reduce((total, order) => total + order.orderTotal, 0);
  }

  function calculateCategorySales(products = []) {
    const categorySales = {};

    products.forEach((product) => {
      const category = product.prodCat;

      if (!categorySales[category]) {
        categorySales[category] = 0;
      }

      categorySales[category] += product.prodPrice * product.prodSold;
    });

    return categorySales;
  }

  function calculateCategoryExp(transactions = []) {
    const categoryExpenses = {};

    transactions.forEach((transaction) => {
      const category = transaction.trCategory;

      if (!categoryExpenses[category]) {
        categoryExpenses[category] = 0;
      }

      categoryExpenses[category] += transaction.trAmount;
    });

    return categoryExpenses;
  }

  function getNextTransactionID(transactions = []) {
    if (transactions.length === 0) {
      return 1;
    }

    const highestID = Math.max(...transactions.map((transaction) => Number(transaction.trID) || 0));
    return highestID + 1;
  }

  function escapeCSVValue(value) {
    const normalized = value == null ? "" : String(value);
    const escaped = normalized.replace(/"/g, '""');

    if (/[",\n\r]/.test(escaped)) {
      return `"${escaped}"`;
    }

    return escaped;
  }

  function generateCSV(data = []) {
    if (!Array.isArray(data) || data.length === 0) {
      return "";
    }

    const headers = Object.keys(data[0]).map(escapeCSVValue).join(",");
    const rows = data.map((record) => Object.values(record).map(escapeCSVValue).join(","));

    return `${headers}\n${rows.join("\n")}`;
  }

  const api = {
    calculateExpTotal,
    calculateRevTotal,
    calculateCategorySales,
    calculateCategoryExp,
    getNextTransactionID,
    generateCSV,
    escapeCSVValue,
  };

  globalScope.bizTrackCore = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
