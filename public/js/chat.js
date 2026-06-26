// public/js/chat.js
console.log("✅ El archivo chat.js se ha cargado correctamente en el navegador.");

// Capturamos los elementos del DOM
const chatForm = document.getElementById('chat-form');
//const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');
const fileUpload = document.getElementById('file-upload');
const btnLeave = document.getElementById('btn-leave');

// ==========================================
// 1. EVENTO: ENVIAR MENSAJE DE TEXTO
// ==========================================
if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault(); // ¡Esto bloquea la recarga de la página!
        
        const msgText = messageInput.value.trim();

        if (msgText && typeof socket !== 'undefined') {
            const messageData = {
                username: currentUser || 'Usuario', 
                room: currentRoom || 'General',     
                text: msgText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            socket.emit('chatMessage', messageData);
            messageInput.value = '';
            messageInput.focus();
        }
    });
}

// ==========================================
// 2. EVENTO: ENVIAR ARCHIVO ADJUNTO
// ==========================================
if (fileUpload) {
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0]; 
        
        if (file && typeof socket !== 'undefined') {
            const reader = new FileReader();
            reader.onload = function(evt) {
                const messageData = {
                    username: currentUser,
                    room: currentRoom,
                    text: `ha enviado un archivo adjunto.`,
                    file: evt.target.result, 
                    fileName: file.name,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                socket.emit('chatMessage', messageData);
            };
            reader.readAsDataURL(file);
            fileUpload.value = ''; 
        }
    });
}

// ==========================================
// 3. EVENTOS DE SOCKET (Solo si el socket existe)
// ==========================================
if (typeof socket !== 'undefined') {
    
    socket.on('message', (messageData) => {
        outputMessage(messageData);
        if (typeof saveMessageToHistory === 'function') {
            saveMessageToHistory(messageData);
        }
        if (messageData.username !== currentUser && typeof playSound === 'function') {
            playSound();
        }
        if (messageContainer) messageContainer.scrollTop = messageContainer.scrollHeight;
    });

    socket.on('notification', (data) => {
        const div = document.createElement('div');
        div.classList.add('message', 'system-msg');
        div.innerHTML = `<p>${data.message}</p>`;
        if (messageContainer) {
            messageContainer.appendChild(div);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
        if (typeof playSound === 'function') playSound();
    });

    socket.on('roomUsers', (userCount) => {
        const onlineUsersSpan = document.getElementById('online-users');
        if (onlineUsersSpan) {
            onlineUsersSpan.innerText = `Usuarios conectados: ${userCount}`;
        }
    });
} else {
    console.error("❌ ERROR CRÍTICO: La variable 'socket' no existe. ¿Se cargó socket.io.js?");
}

// ==========================================
// 4. FUNCIONALIDAD: SALIR DE LA SALA
// ==========================================
if (btnLeave) {
    btnLeave.addEventListener('click', () => {
        window.location.reload(); // Recarga la página y te devuelve al login limpiamente
    });
}

// ==========================================
// FUNCIÓN AUXILIAR: RENDERIZAR MENSAJES
// ==========================================
function outputMessage(messageData) {
    if (!messageContainer) return;
    
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

    messageContainer.appendChild(div);
}