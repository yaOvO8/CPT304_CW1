const assert = require("node:assert/strict");
const {
  calculateExpTotal,
  calculateRevTotal,
  calculateCategorySales,
  calculateCategoryExp,
  getNextTransactionID,
  generateCSV,
  escapeCSVValue,
} = require("../biztrack-core.js");

module.exports = [
  {
    name: "calculateExpTotal sums expense amounts",
    fn() {
      assert.equal(calculateExpTotal([{ trAmount: 10 }, { trAmount: 12.5 }, { trAmount: 7.5 }]), 30);
    },
  },
  {
    name: "calculateRevTotal sums order totals",
    fn() {
      assert.equal(calculateRevTotal([{ orderTotal: 99.99 }, { orderTotal: 50.01 }]), 150);
    },
  },
  {
    name: "calculateCategorySales groups revenue by product category",
    fn() {
      assert.deepEqual(calculateCategorySales([
        { prodCat: "Hats", prodPrice: 10, prodSold: 2 },
        { prodCat: "Hats", prodPrice: 5, prodSold: 1 },
        { prodCat: "Drinkware", prodPrice: 20, prodSold: 3 },
      ]), {
        Hats: 25,
        Drinkware: 60,
      });
    },
  },
  {
    name: "calculateCategoryExp groups expenses by category",
    fn() {
      assert.deepEqual(calculateCategoryExp([
        { trCategory: "Rent", trAmount: 100 },
        { trCategory: "Rent", trAmount: 50 },
        { trCategory: "Utilities", trAmount: 20 },
      ]), {
        Rent: 150,
        Utilities: 20,
      });
    },
  },
  {
    name: "getNextTransactionID returns the next highest id",
    fn() {
      assert.equal(getNextTransactionID([{ trID: 1 }, { trID: 5 }, { trID: 3 }]), 6);
    },
  },
  {
    name: "getNextTransactionID starts at 1 for empty data",
    fn() {
      assert.equal(getNextTransactionID([]), 1);
    },
  },
  {
    name: "getNextTransactionID ignores non-numeric ids",
    fn() {
      assert.equal(getNextTransactionID([{ trID: "abc" }, { trID: 4 }]), 5);
    },
  },
  {
    name: "escapeCSVValue escapes quotes and commas only when needed",
    fn() {
      assert.equal(escapeCSVValue('hello, "world"'), '"hello, ""world"""');
      assert.equal(escapeCSVValue("plain"), "plain");
      assert.equal(escapeCSVValue(null), "");
    },
  },
  {
    name: "generateCSV produces escaped headers and values",
    fn() {
      const csv = generateCSV([
        {
          name: 'Widget, "A"',
          notes: "Line 1\nLine 2",
        },
      ]);

      assert.match(csv, /name,notes/);
      assert.match(csv, /"Widget, ""A"""/);
      assert.match(csv, /"Line 1\nLine 2"/);
    },
  },
  {
    name: "generateCSV returns an empty string for empty or invalid input",
    fn() {
      assert.equal(generateCSV([]), "");
      assert.equal(generateCSV(null), "");
    },
  },
];
