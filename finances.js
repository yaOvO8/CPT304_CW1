function openSidebar() {
    var side = document.getElementById('sidebar');
    side.style.display = (side.style.display === "block") ? "none" : "block";
}

function closeSidebar() {
    document.getElementById('sidebar').style.display = 'none';
}


function openForm() {
    var form = document.getElementById("transaction-form")
    form.style.display = (form.style.display === "block") ? "none" : "block";
}

function closeForm() {
    document.getElementById("transaction-form").style.display = "none";
}


let transactions = [];

function initializeFinancesPage() {
    const storedTransactions = localStorage.getItem("bizTrackTransactions");
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    } else {
        transactions = [
            {
                trID: 1,
                trDate: "2024-01-05",
                trCategory: "Rent",
                trAmount: 100.00,
                trNotes: "January Rent"
            },
            {
                trID: 2,
                trDate: "2024-01-15",
                trCategory: "Order Fulfillment",
                trAmount: 35.00,
                trNotes: "Order #1005"
            },
            {
                trID: 3,
                trDate: "2024-01-08",
                trCategory: "Utilities",
                trAmount: 120.00,
                trNotes: "Internet"
            },
            {
                trID: 4,
                trDate: "2024-02-05",
                trCategory: "Supplies",
                trAmount: 180.00,
                trNotes: "Embroidery Machine"
            },
            {
                trID: 5,
                trDate: "2024-01-25",
                trCategory: "Miscellaneous",
                trAmount: 20.00,
                trNotes: "Pizza"
            },
        ];

  
        localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));
    }
  
    renderTransactions(transactions);
}

function addOrUpdate(event) {
    event.preventDefault();
    let type = document.getElementById("submitBtn").dataset.mode;
    if (type === 'add') {
        newTransaction(event);
    } else if (type === 'update'){
        const trId = document.getElementById("tr-id").value;
        updateTransaction(+trId); // convert to number
    }
}

function newTransaction(event) {
    event.preventDefault();
    const trDate = document.getElementById("tr-date").value;
    const trCategory = document.getElementById("tr-category").value;
    const trAmount = parseFloat(document.getElementById("tr-amount").value);
    const trNotes = document.getElementById("tr-notes").value;

    const trID = bizTrackCore.getNextTransactionID(transactions);
    
    const transaction = {
        trID,
        trDate,
        trCategory,
        trAmount,
        trNotes,
    };
    
    transactions.push(transaction);
    renderTransactions(transactions);
    localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));
    showStatusMessage(t("expenses.msg.added"));
    displayExpenses();
    document.getElementById("transaction-form").reset();
    closeForm();
}

function createCell(text, className = "") {
    const cell = document.createElement("td");
    cell.textContent = text;

    if (className) {
        cell.className = className;
    }

    return cell;
}

function createActionIcon({ label, iconClassName, onClick }) {
    const button = document.createElement("button");
    const icon = document.createElement("i");

    button.type = "button";
    button.setAttribute("aria-label", label);
    button.addEventListener("click", onClick);

    icon.className = iconClassName;
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);

    return button;
}


function renderTransactions(transactions) {
    const transactionTableBody = document.getElementById("tableBody");
    transactionTableBody.innerHTML = "";

    const transactionToRender = transactions;

    transactionToRender.forEach((transaction, index) => {
        const transactionRow = document.createElement("tr");
        transactionRow.className = "transaction-row";

        transactionRow.dataset.trID = transaction.trID;
        transactionRow.dataset.trDate = transaction.trDate;
        transactionRow.dataset.trCategory = transaction.trCategory;
        transactionRow.dataset.trAmount = transaction.trAmount;
        transactionRow.dataset.trNotes = transaction.trNotes;

        const formattedAmount = typeof transaction.trAmount === 'number' ? formatCurrency(transaction.trAmount) : '';

        transactionRow.appendChild(createCell(String(index + 1)));
        transactionRow.appendChild(createCell(transaction.trDate));
        transactionRow.appendChild(createCell(translateDynamicValue("category", transaction.trCategory)));
        transactionRow.appendChild(createCell(formattedAmount, "tr-amount"));
        transactionRow.appendChild(createCell(transaction.trNotes));

        const actionCell = document.createElement("td");
        actionCell.className = "action";

        actionCell.appendChild(createActionIcon({
            label: t("expenses.action.edit", { id: transaction.trID }),
            iconClassName: "edit-icon fa-solid fa-pen-to-square",
            onClick: () => editRow(transaction.trID),
        }));

        actionCell.appendChild(createActionIcon({
            label: t("expenses.action.delete", { id: transaction.trID }),
            iconClassName: "delete-icon fas fa-trash-alt",
            onClick: () => deleteTransaction(transaction.trID),
        }));

        transactionRow.appendChild(actionCell);
        transactionTableBody.appendChild(transactionRow);
  });
  displayExpenses();
}

function displayExpenses() {
    const resultElement = document.getElementById("total-expenses");

    const totalExpenses = transactions
        .reduce((total, transaction) => total + transaction.trAmount,0);

    resultElement.innerHTML = `
        <span>${t("expenses.totalExpenses", { amount: formatCurrency(totalExpenses) })}</span>
    `;
}

function editRow(trID) {
    const trToEdit = transactions.find(transaction => transaction.trID == trID);
    
    document.getElementById("tr-id").value = trToEdit.trID;      
    document.getElementById("tr-date").value = trToEdit.trDate;
    document.getElementById("tr-category").value = trToEdit.trCategory;
    document.getElementById("tr-amount").value = trToEdit.trAmount;
    document.getElementById("tr-notes").value = trToEdit.trNotes;
  
    document.getElementById("submitBtn").dataset.mode = "update";
    document.getElementById("submitBtn").textContent = t("common.update");

    document.getElementById("transaction-form").style.display = "block";
    clearStatusMessage();
  }
  
function deleteTransaction(trID) {
    const indexToDelete = transactions.findIndex(transaction => transaction.trID == trID);

    if (indexToDelete !== -1) {
        transactions.splice(indexToDelete, 1);

        localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));

        renderTransactions(transactions);
        showStatusMessage(t("expenses.msg.deleted"));
    }
}

  function updateTransaction(trID) {
    const indexToUpdate = transactions.findIndex(transaction => transaction.trID === trID);

    if (indexToUpdate !== -1) {
        const updatedTransaction = {
            trID: trID,
            trDate: document.getElementById("tr-date").value,
            trCategory: document.getElementById("tr-category").value,
            trAmount: parseFloat(document.getElementById("tr-amount").value),
            trNotes: document.getElementById("tr-notes").value,
        };

        transactions[indexToUpdate] = updatedTransaction;

        localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));

        renderTransactions(transactions);
        showStatusMessage(t("expenses.msg.updated"));

        document.getElementById("transaction-form").reset();
        document.getElementById("submitBtn").dataset.mode = "add";
        document.getElementById("submitBtn").textContent = t("common.add");
        closeForm();
    }
}

function sortTable(column, button) {
    const tbody = document.getElementById("tableBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const headers = document.querySelectorAll("#finance-table thead th");
    const headerCell = button.closest("th");
    const isAscending = headerCell.getAttribute("aria-sort") !== "ascending";

    const isNumeric = column === "trID" || column === "trAmount";

    const sortedRows = rows.sort((a, b) => {
        const aValue = isNumeric ? parseFloat(a.dataset[column]) : a.dataset[column];
        const bValue = isNumeric ? parseFloat(b.dataset[column]) : b.dataset[column];

        if (typeof aValue === "string" && typeof bValue === "string") {
            return isAscending
                ? aValue.localeCompare(bValue, undefined, { sensitivity: "base" })
                : bValue.localeCompare(aValue, undefined, { sensitivity: "base" });
        } else {
            return isAscending ? aValue - bValue : bValue - aValue;
        }
    });

    headers.forEach(header => header.removeAttribute("aria-sort"));
    headerCell.setAttribute("aria-sort", isAscending ? "ascending" : "descending");

    rows.forEach(row => tbody.removeChild(row));

    sortedRows.forEach(row => tbody.appendChild(row));
}

function performSearch() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll(".transaction-row");

    rows.forEach(row => {
        const text = (row.innerText || row.textContent || "").toLowerCase();
        const visible = text.includes(searchInput);
        row.style.display = visible ? "table-row" : "none";
    });
}


function exportToCSV() {
    const transactionsToExport = transactions.map(transaction => {
        return {
            trID: transaction.trID,
            trDate: transaction.trDate,
            trCategory: transaction.trCategory,
            trAmount: transaction.trAmount.toFixed(2),
            trNotes: transaction.trNotes,
        };
    });
  
    const csvContent = bizTrackCore.generateCSV(transactionsToExport);
  
    const blob = new Blob([csvContent], { type: 'text/csv' });
  
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'biztrack_expense_table.csv';
  
    document.body.appendChild(link);
    link.click();
  
    document.body.removeChild(link);
}

document.addEventListener("biztrack:languagechange", function () {
    renderTransactions(transactions);
    const submitButton = document.getElementById("submitBtn");
    if (submitButton) {
        submitButton.textContent = t(submitButton.dataset.mode === "update" ? "common.update" : "common.add");
    }
});

function handleFinanceSearchKeyup(event) {
    if (event.key === "Enter") {
        performSearch();
    }
}

function handleFinancesLanguageChange() {
    renderTransactions(transactions);
    const submitButton = document.getElementById("submitBtn");
    if (submitButton) {
        submitButton.textContent = t(submitButton.dataset.mode === "update" ? "common.update" : "common.add");
    }
}

function getTransactionsState() {
    return transactions;
}

function setTransactionsState(nextTransactions) {
    transactions = nextTransactions;
}

if (typeof document !== "undefined") {
    const shouldAutoInit = !(typeof window !== "undefined" && window.__BIZTRACK_DISABLE_AUTO_INIT__);
    if (shouldAutoInit) {
        initializeFinancesPage();
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", handleFinanceSearchKeyup);
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        openSidebar,
        closeSidebar,
        openForm,
        closeForm,
        initializeFinancesPage,
        addOrUpdate,
        newTransaction,
        createCell,
        createActionIcon,
        renderTransactions,
        displayExpenses,
        editRow,
        deleteTransaction,
        updateTransaction,
        sortTable,
        performSearch,
        exportToCSV,
        handleFinanceSearchKeyup,
        handleFinancesLanguageChange,
        getTransactionsState,
        setTransactionsState,
    };
}
