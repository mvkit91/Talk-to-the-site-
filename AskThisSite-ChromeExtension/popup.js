document.addEventListener('DOMContentLoaded', function() {
  const askButton = document.getElementById('askButton');
  const questionInput = document.getElementById('question');
  const chatContainer = document.getElementById('chat-container');
  const errorDiv = document.getElementById('error');

  let isProcessing = false;

  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
    
    const messageBubble = document.createElement('div');
    messageBubble.className = `max-w-3/4 p-3 rounded-lg ${
      isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
    }`;
    messageBubble.textContent = content;
    
    messageDiv.appendChild(messageBubble);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function addLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'flex justify-start';
    loadingDiv.innerHTML = `
      <div class="bg-gray-200 text-gray-800 p-3 rounded-lg flex items-center">
        <span class="loading-dots">Thinking</span>
      </div>
    `;
    loadingDiv.id = 'loading-message';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, 5000);
  }

  askButton.addEventListener('click', async function() {
    if (isProcessing) return;
    
    const question = questionInput.value.trim();
    if (!question) return;

    isProcessing = true;
    askButton.disabled = true;
    errorDiv.classList.add('hidden');
    
    addMessage(question, true);
    addLoadingMessage();
    
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      const [{result}] = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: () => {
          return document.body.innerText;
        }
      });

      const response = await fetch('http://35.163.186.101/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          content: result
        })
      });

      const data = await response.json();
      removeLoadingMessage();
      
      if (data.error) {
        showError(data.error);
      } else {
        addMessage(data.reply);
      }
    } catch (error) {
      removeLoadingMessage();
      showError('Failed to get response. Please try again.');
    } finally {
      isProcessing = false;
      askButton.disabled = false;
      questionInput.value = '';
    }
  });

  questionInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      askButton.click();
    }
  });
});