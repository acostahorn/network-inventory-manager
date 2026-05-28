document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('admin-chat-box');
    const replyForm = document.getElementById('admin-reply-form');
    const msgInput = document.getElementById('admin-msg-input');
    const userId = replyForm?.getAttribute('data-user-id');

    let lastTimestamp = null;

    // --- 1. INITIALIZE ---
    // Look at existing messages rendered by EJS to find the last timestamp
    const existingMsgs = document.querySelectorAll('.message-item');
    if (existingMsgs.length > 0) {
        const lastMsg = existingMsgs[existingMsgs.length - 1];
        lastTimestamp = new Date(lastMsg.dataset.timestamp).getTime();
    }

    // --- 2. THE REFRESH FUNCTION ---
    async function syncMessages() {
        try {
            const response = await fetch(`/conversations/${userId}/status`);
            if (!response.ok) return;

            const data = await response.json();

            data.messages.forEach(msg => {
                const msgTime = new Date(msg.timestamp).getTime();

                // Only append if it's newer than our last seen message
                // AND it's not from 'admin' (because we append admin messages instantly on 'submit')
                if (!lastTimestamp || msgTime > lastTimestamp) {
                    if (msg.sender !== 'admin') {
                        appendMessage(msg.sender, msg.text, msg.timestamp);
                    }
                    lastTimestamp = msgTime;
                }
            });
        } catch (err) {
            console.error("Sync error:", err);
        }
    }

    // --- 3. THE APPEND FUNCTION ---
    function appendMessage(sender, text, timestamp) {
        // Ensure we have a valid date object to work with
        const dateObj = timestamp ? new Date(timestamp) : new Date();
        const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement('div');
        const isSelf = sender === 'admin';

        div.className = `message-item mb-3 d-flex ${isSelf ? 'justify-content-end' : 'justify-content-start'}`;
        div.dataset.timestamp = timestamp;

        // 2. Create the internal bubble (This prevents the text from filling the whole width)
        const bubble = document.createElement('div');
        bubble.className = `p-3 rounded shadow-sm msg-${sender}`;
        bubble.style.maxWidth = "70%";

        // 3. Build the content safely
        const bold = document.createElement('strong');
        bold.textContent = `${sender.toUpperCase()}: `;

        const messageBody = document.createTextNode(text);

        const timeDiv = document.createElement('div');
        timeDiv.className = "text-end mt-1";
        timeDiv.style.fontSize = "0.7rem";
        timeDiv.style.opacity = "0.8";
        timeDiv.textContent = timeString;

        // 4. Assembly
        bubble.appendChild(bold);
        bubble.appendChild(document.createElement('br')); // Adds the line break
        bubble.appendChild(messageBody);
        bubble.appendChild(timeDiv);

        div.appendChild(bubble); // Put the bubble inside the flex container

        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // --- 4. HANDLE SENDING ---
    if (replyForm) {
        replyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = msgInput.value.trim();
            if (!text) return;

            // Clear input immediately
            msgInput.value = '';

            // Optimistic UI: Show the message immediately
            const now = new Date().toISOString();
            appendMessage('admin', text, now);
            lastTimestamp = new Date(now).getTime();

            try {
                await fetch(`/conversations/${userId}/admin-reply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
            } catch (err) {
                console.error("Send error:", err);
            }
        });
    }

    // --- 5. START POLLING ---
    // No more full reloads! Just a background fetch every 4 seconds.
    setInterval(syncMessages, 4000);
    // --- 6. END CHAT & RESTORE BOT ---
    const endChatBtn = document.getElementById('end-chat-btn');

    if (endChatBtn) {
        endChatBtn.addEventListener('click', async () => {
            if (!confirm("Are you sure you want to end this manual session and restore the bot?")) return;

            // Use the userId we already captured at the top of the script
            try {
                const response = await fetch(`/conversations/${userId}/end-chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    alert("Bot restored! Redirecting to dashboard...");
                    window.location.href = "/admin/conversations";
                } else {
                    alert("Failed to restore bot.");
                }
            } catch (error) {
                console.error("Error ending chat:", error);
            }
        });
    }
    // --- 7. INITIAL SCROLL TO BOTTOM ---
    if (chatBox) {
        // Small timeout ensures the browser has rendered all EJS messages
        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 100);
    }
const clearChatBtn = document.getElementById('clear-chat');

if (clearChatBtn) {
clearChatBtn.addEventListener('click', async () => {
    
    if (!confirm("Clear chat history? You will not be able to recover it!")) return;

    // 1. Tell the server to delete the history
    const response = await fetch(`/conversations/${userId}/clear`, {
        method: 'POST'
    });

    if (response.ok) {
        // 2. ONLY clear the UI if the server succeeded
        chatBox.replaceChildren();
        lastTimestamp = null; // Reset this so it doesn't try to sync old stuff
        console.log("Chat history wiped.");
    }
});
}

});


