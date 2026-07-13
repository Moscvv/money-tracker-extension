
//Reads all expenses from storage as soon as this page loads
chrome.storage.local.get({ expenses: [] }, function (result) {
    const expenses = result.expenses;

    renderTotal(expenses);
    renderDailyTable(expenses);
    renderExpenseTable(expenses);
});


// Map currency codes to their display simbol
const currencySymbols = {
  USD: "$",
  GBP: "\u00A3",
  EUR: "\u20AC",
  JPY: "\u00A5",
  AUD: "A$"
};

function formatMoney(amount, currency) {
    const symbol = currencySymbols[currency] || "";
    return symbol + amount.toFixed(2);
}


//Adds up all the expenses and displays the total
function renderTotal(expenses) {
    const totalsByCurrency = {};


    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const currency = expense.currency || "USD"; // fallback for old data without currency

        if (!totalsByCurrency[currency]) {
            totalsByCurrency[currency] = 0;
        }
        totalsByCurrency[currency] += expense.amount;
    }

    const totalLines = [];
    for (const currency in totalsByCurrency) {
        totalLines.push(formatMoney(totalsByCurrency[currency], currency));
    }

    document.getElementById("totalSpent").textContent = totalLines.join(" + ");
}



//Group expenses by day (only day part, not the time), and total each group.
function renderDailyTable(expenses) {
    const totalsByDayAndCurrency = {};
    
    for (let i = 0; i < expenses.length; i++) {
       const expense = expenses[i];
       const dayKey = expense.date.split("T")[0]; // "2025-03-01T10:00:00" -> "2025-03-01"
       const currency = expense.currency || "USD";
       const combinedKey = dayKey + "|" + currency; // e.g. "2024-05-01|EUR"
  
       if (!totalsByDayAndCurrency[combinedKey]) {
        totalsByDayAndCurrency[combinedKey] = 0;
       }
       totalsByDayAndCurrency[combinedKey] += expense.amount;
    }

    const tableBody = document.querySelector("#dailyTable tbody");
    tableBody.innerHTML = "";

    for (const combinedKey in totalsByDayAndCurrency) {
        const [day, currency] = combinedKey.split("|");
        const row = document.createElement("tr");
        row.innerHTML = "<td>" + day + "</td><td>" + formatMoney(totalsByDayAndCurrency[combinedKey], currency) + "</td>";
        tableBody.appendChild(row);
    }
}



//List every single expense as its own row
function renderExpenseTable(expenses) {
    const tableBody = document.querySelector("#expenseTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows, old rows

    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const day = expense.date.split("T")[0];

        const row = document.createElement("tr");
        row.innerHTML =
          "<td>" + day + "</td>" +
          "<td>" + expense.category + "</td>" +
          "<td>" + formatMoney(expense.amount, expense.currency || "USD") +  "</td>" +
          "<td><button class='deleteButton' data-id='" + expense.id + "'>Delete</button></td>";
        tableBody.appendChild(row);
    }

    //Attach a click handler to each delete button
    const deleteButtons = document.querySelectorAll(".deleteButton");
    deleteButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const idToDelete = Number(button.getAttribute("data-id"));
            deleteExpense(idToDelete);
        });
    });    
}

function deleteExpense(idToDelete) {
    chrome.storage.local.get({ expenses: [] }, function (result) {
        const expenses = result.expenses;
        const updatedExpenses = expenses.filter(function (expense) {
            return expense.id !== idToDelete;
        });

        chrome.storage.local.set({ expenses: updatedExpenses }, function () {
            location.reload(); // Refresh the page to show updated tables
        });
    });
}            