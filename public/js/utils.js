// public/js/utils.js

// ==========================================
// 1. SISTEMA DE NOTIFICACIONES (Fase 4)
// ==========================================

// Ruta corregida: apunta directamente desde el index.html
const notificationSound = new Audio('./assets/notification.mp3');

function playSound() {
    notificationSound.play().catch(error => {
        console.warn('El navegador bloqueó el audio automático:', error);
    });
}

function showSystemMessage(text) {
    const messageContainer = document.getElementById('message-container');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'system-msg');
    msgDiv.innerHTML = `<p>${text}</p>`;
    messageContainer.appendChild(msgDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function showToast(text) {
    const toast = document.createElement('div');
    toast.classList.add('toast-notification');
    toast.innerText = text;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// 2. ALMACENAMIENTO E HISTORIAL (Tu código)
// ==========================================

function saveMessageToHistory(messageData) {
    const historyKey = `chatHistory_${messageData.room}`;
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    history.push(messageData);
    localStorage.setItem(historyKey, JSON.stringify(history));
}

function loadRoomHistory(roomName) {
    const historyKey = `chatHistory_${roomName}`;
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];
    const messagesToShow = history.slice(-50); 

    messagesToShow.forEach(msg => {
        if(typeof outputMessage === 'function') {
            outputMessage(msg, true); 
        }
    });
}

// ==========================================
// 3. BÚSQUEDA Y SCROLL INFINITO (Tu código)
// ==========================================

const chatHeader = document.querySelector('.chat-header');
if (chatHeader) {
    const searchContainer = document.createElement('div');
    searchContainer.innerHTML = `
        <input type="text" id="search-history" placeholder="Buscar mensaje..." style="padding: 5px; border-radius: 5px; border: 1px solid #ccc; font-size: 0.8rem;">
    `;
    chatHeader.insertBefore(searchContainer, chatHeader.lastElementChild);

    const searchInput = document.getElementById('search-history');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const messagesNodes = document.querySelectorAll('#message-container .message:not(.system-msg)');

        messagesNodes.forEach(msgNode => {
            const msgText = msgNode.querySelector('.text')?.innerText.toLowerCase() || "";
            if (msgText.includes(searchTerm)) {
                msgNode.style.display = 'block';
            } else {
                msgNode.style.display = 'none';
            }
        });
    });
}

let currentMessageOffset = 50; 
const msgContainer = document.getElementById('message-container');

if (msgContainer) {
    msgContainer.addEventListener('scroll', () => {
        if (msgContainer.scrollTop === 0) {
            // Nota: currentRoom debe estar disponible globalmente (ej. desde auth.js)
            const historyKey = `chatHistory_${currentRoom}`;
            const history = JSON.parse(localStorage.getItem(historyKey)) || [];
            
            if (currentMessageOffset < history.length) {
                const nextBatch = history.slice(-currentMessageOffset - 50, -currentMessageOffset);
                currentMessageOffset += 50;

                const previousHeight = msgContainer.scrollHeight;

                nextBatch.reverse().forEach(msg => {
                    prependMessage(msg);
                });

                msgContainer.scrollTop = msgContainer.scrollHeight - previousHeight;
            }
        }
    });
}

function prependMessage(messageData) {
    const div = document.createElement('div');
    
    // Nota: currentUser debe estar disponible globalmente (ej. desde auth.js)
    if (messageData.username === currentUser) {
        div.classList.add('message', 'sent');
        div.innerHTML = `<p class="text">${messageData.text}</p>
                         <span class="time" style="font-size: 0.7rem; color: #666; display: block; text-align: right; margin-top: 5px;">${messageData.time}</span>`;
    } else {
        div.classList.add('message', 'received');
        div.innerHTML = `<p class="meta" style="font-weight: bold; font-size: 0.8rem; margin-bottom: 5px; color: var(--primary-color);">${messageData.username}</p>
                         <p class="text">${messageData.text}</p>
                         <span class="time" style="font-size: 0.7rem; color: #666; display: block; text-align: right; margin-top: 5px;">${messageData.time}</span>`;
    }
    msgContainer.insertBefore(div, msgContainer.firstChild);
}