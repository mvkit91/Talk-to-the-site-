chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fetchContent') {
        const content = message.content;
        const question = "What is the content of this page?"; // Or dynamically fetch the user's question

        // Make the request to Flask server
        fetch('http://35.163.186.101/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: question,
                content: content
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received from server:', data);
            // Check if the reply exists before accessing it
            if (data && data.reply) {
                sendResponse({ reply: data.reply });
            } else {
                console.error('Unexpected response format:', data);
                sendResponse({ reply: 'No reply from server.' });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({ reply: 'Error connecting to server.' });
        });

        // Keep the messaging channel open for async response
        return true;
    }
});
