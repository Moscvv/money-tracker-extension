//grab references to the HTML elemnts we need to work with
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const saveButton = document.getElementById("saveButton");
const statusMessage = document.getElementById("statusMessage");
const currencyInput = document.getElementById("currencyInput");


//ask the content script (running on the actual webpage) for any prices it found
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    chrome.tabs.sendMessage(currentTab.id, { type: "GET_PRICES" }, function (response) {
        if (chrome.runtime.lastError || !response) {
            // this will happen on pages where script can't run, like the Chrome Web Store or some internal pages
            return;
        }
        displayPriceSuggestions(response.prices);
    });
});

//Show the found prices as clickable buttons that fill in the amount field
function displayPriceSuggestions(prices) {
    if (!prices || prices.length === 0) return;

    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.innerHTML = "<p>Detected on this page:</p>";

    prices.forEach(function (price) {
        const button = document.createElement("button");
        button.textContent = price;
        button.style.marginRight = "4px";
        button.style.marginBottom = "4px";

        button.addEventListener("click", function () {
            // Strip out everything except digits and the decimal point, so "£29.99" becomes "29.99"
            const numericValue = price.replace(/[^0-9.]/g, "");
            amountInput.value = numericValue;

            console.log("Raw price string:", JSON.stringify(price));
            console.log("Char codes:", [...price].map(c => c.charCodeAt(0)));

            // figuring wich currency symbol was used, and remember it
            if (price.includes("\u00A3")) {        // £
              currencyInput.value = "GBP";
            } else if (price.includes("\u20AC")) { // €
              currencyInput.value = "EUR";
            } else if (price.includes("\u00A5")) { // ¥
              currencyInput.value = "JPY";
            } else if (price.includes("A$") || price.toUpperCase().includes("AUD")) {
              currencyInput.value = "AUD";
            } else {
              currencyInput.value = "USD";
            }

        });
        
        suggestionsContainer.appendChild(button);
    });
    
    document.body.insertBefore(suggestionsContainer, saveButton);
}


//This function runs when the Save button is clicked
saveButton.addEventListener("click", function () {
    const amount = amountInput.value;
    const category = categoryInput.value;

    //this is a basic check: do not save empty or invalid amounts
    if (!amount || isNaN(amount)) {
        statusMessage.textContent = "Please enter a valid amount.";
        return;
    }

    //Expense record
    const newExpense = {
        id: Date.now(), //unique id based on timestamp
        amount: parseFloat(amount),
        currency: currencyInput.value,
        category: category,
        date: new Date().toISOString()
    };

    //reading existing expenses, add the new one, save back
    chrome.storage.local.get({ expenses: [] }, function (result) {
        const expenses = result.expenses;
        expenses.push(newExpense);

        chrome.storage.local.set({ expenses: expenses }, function () {
            statusMessage.textContent = "Saved!";
            amountInput.value = "";
            selectedCurrency = "USD"; //reset to default
        });
    });
});


//Opens the dashboard in a new full browser tab
const dashboardButton = document.getElementById("dashboardButton");
dashboardButton.addEventListener("click", function () {
    chrome.tabs.create({ url: "dashboard.html" });
});
