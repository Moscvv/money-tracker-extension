// This file runs INSIDE the actual webpage you're visiting (not the popup)

// One pattern per currency style, then combined together
const dollarPoundEuroPattern = /(?<!A)[\$\u00A3\u20AC]\d{1,3}(,\d{3})*(\.\d{2})?/g; // $, £, € (but not A$)
const euroAfterPattern = /\d{1,3}(,\d{3})*(\.\d{2})?\u20AC/g;
const yenPattern = /\u00A5\d{1,3}(,\d{3})*/g;
const audPattern = /(A\$|AUD\s?)\d{1,3}(,\d{3})*(\.\d{2})?/g;

function findPricesOnPage() {
    const pageText = document.body.innerText;


    // Run each pattern separately, then merge all the results into one list
    const allMatches = [
        ...(pageText.match(dollarPoundEuroPattern) || []),
        ...(pageText.match(euroAfterPattern) || []),
        ...(pageText.match(yenPattern) || []),
        ...(pageText.match(audPattern) || [])
    ];

    return [...new Set(allMatches)]; // Remove duplicates by converting to a Set, then back into a list
}

// Listen for a message asking for prices, and reply with the list
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "GET_PRICES") {
        const prices = findPricesOnPage();
        sendResponse({ prices: prices });
    }
});