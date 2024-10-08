// Get the text content of the web page
let pageContent = document.body.innerText;

// Send the page content to the background script
chrome.runtime.sendMessage({
    action: 'fetchContent',
    content: pageContent
});
