const chatBox = document.getElementById('chat-box') as HTMLDivElement;
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;

function appendMessage(text: string, sender: 'user' | 'ai') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleSendMessage() {
    const query = chatInput.value.trim();
    if (!query) return;
    
    appendMessage(query, 'user');
    chatInput.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message:query })
        });
        const data = await response.json();
        appendMessage(data.reply || 'No reponse needed from assistant.', 'ai');
    } catch (error) {
        appendMessage('Error connecting to assistant server.', 'ai')
    }    
}

sendBtn.addEventListener('click', handleSendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSendMessage();
});
