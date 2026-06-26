// public/js/chat.js

// Capturamos los elementos del DOM
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');
const fileUpload = document.getElementById('file-upload'); // Elemento para adjuntar archivos

// ==========================================
// 1. EVENTO: ENVIAR MENSAJE DE TEXTO
// ==========================================
chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const msgText = messageInput.value.trim();

    if (msgText) {
        const messageData = {
            username: currentUser, 
            room: currentRoom,     
            text: msgText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        socket.emit('chatMessage', messageData);

        messageInput.value = '';
        messageInput.focus();
    }
});

// ==========================================
// 2. EVENTO: ENVIAR ARCHIVO ADJUNTO
// ==========================================
fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0]; 
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(evt) {
            const messageData = {
                username: currentUser,
                room: currentRoom,
                text: `ha enviado un archivo adjunto.`,
                file: evt.target.result, // El archivo convertido a Base64
                fileName: file.name,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            socket.emit('chatMessage', messageData);
        };
        
        reader.readAsDataURL(file);
        fileUpload.value = ''; 
    }
});

// ==========================================
// 3. EVENTO: RECIBIR MENSAJE DEL SERVIDOR
// ==========================================
socket.on('message', (messageData) => {
    outputMessage(messageData);
    
    if (typeof saveMessageToHistory === 'function') {
        saveMessageToHistory(messageData);
    }

    // Reproducimos sonido si el mensaje es de otra persona
    if (messageData.username !== currentUser && typeof playSound === 'function') {
        playSound();
    }
    
    messageContainer.scrollTop = messageContainer.scrollHeight;
});

// ==========================================
// 4. EVENTO: RECIBIR NOTIFICACIÓN (EJ. ENTRADAS/SALIDAS)
// ==========================================
socket.on('notification', (data) => {
    const div = document.createElement('div');
    div.classList.add('message', 'system-msg');
    div.innerHTML = `<p>${data.message}</p>`;
    messageContainer.appendChild(div);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Reproducimos sonido en eventos del sistema
    if (typeof playSound === 'function') {
        playSound();
    }
});

// ==========================================
// FUNCIÓN AUXILIAR: RENDERIZAR MENSAJES (Y ARCHIVOS)
// ==========================================
function outputMessage(messageData) {
    const div = document.createElement('div');
    
    // Verificamos si el mensaje contiene un archivo adjunto
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