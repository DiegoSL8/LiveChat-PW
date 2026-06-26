// public/js/utils.js

// ==========================================
// 1. SISTEMA DE NOTIFICACIONES
// ==========================================
const notificationSound = new Audio('./assets/notification.mp3');

function playSound() {
    notificationSound.play().catch(error => {
        console.warn('El navegador bloqueó el audio automático (requiere interacción previa):', error.message);
    });
}

// ==========================================
// 2. ALMACENAMIENTO E HISTORIAL LOCALSTORAGE
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
    const messagesToShow = history.slice(-50); // Carga inicial de 50 mensajes

    messagesToShow.forEach(msg => {
        if(typeof outputMessage === 'function') {
            outputMessage(msg); 
        }
    });
}

// ==========================================
// 3. BÚSQUEDA EN EL HISTORIAL (Adaptado a HTML)
// ==========================================
const searchInput = document.getElementById('search-history');

if (searchInput) {
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

// ==========================================
// 4. SCROLL INFINITO (Historial pasado)
// ==========================================
let currentMessageOffset = 50; 
const msgContainer = document.getElementById('message-container');

if (msgContainer) {
    msgContainer.addEventListener('scroll', () => {
        if (msgContainer.scrollTop === 0) {
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

// Función idéntica a outputMessage pero inserta al INICIO del chat (para scroll infinito)
function prependMessage(messageData) {
    const div = document.createElement('div');
    
    let fileHTML = '';
    if (messageData.file) {
        if (messageData.file.startsWith('data:image')) {
            fileHTML = `<br><img src="${messageData.file}" style="max-width: 100%; border-radius: 5px; margin-top: 5px;">`;
        } else {
            fileHTML = `<br><a href="${messageData.file}" download="${messageData.fileName}" style="color: var(--primary-color); text-decoration: underline; font-weight: bold;">📁 Descargar ${messageData.fileName}</a>`;
        }
    }

    if (messageData.username === currentUser) {
        div.classList.add('message', 'sent');
        div.innerHTML = `
            <p class="text">${messageData.text}</p>
            ${fileHTML}
            <span class="time" style="font-size: 0.7rem; color: #666; display: block; text-align: right; margin-top: 5px;">${messageData.time}</span>
        `;
    } else {
        div.classList.add('message', 'received');
        div.innerHTML = `
            <p class="meta" style="font-weight: bold; font-size: 0.8rem; margin-bottom: 5px; color: var(--primary-color);">${messageData.username}</p>
            <p class="text">${messageData.text}</p>
            ${fileHTML}
            <span class="time" style="font-size: 0.7rem; color: #666; display: block; text-align: right; margin-top: 5px;">${messageData.time}</span>
        `;
    }
    msgContainer.insertBefore(div, msgContainer.firstChild);
}