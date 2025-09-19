document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  const chatHistory = [];

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) {
      return;
    }

    addMessageToChatBox('user', userMessage);
    userInput.value = '';

    chatHistory.push({ role: 'user', message: userMessage });

    const thinkingMessage = addMessageToChatBox('bot', 'Thinking...');

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server.');
      }

      const data = await response.json();

      if (data.message) {
        thinkingMessage.textContent = data.message;
        chatHistory.push({ role: 'model', message: data.message });
      } else {
        thinkingMessage.textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      thinkingMessage.textContent = 'Failed to get response from server.';
      console.error('Error:', error);
    }
  });

  function addMessageToChatBox(role, content) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${role}-message`);
    messageElement.textContent = content;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  }
});