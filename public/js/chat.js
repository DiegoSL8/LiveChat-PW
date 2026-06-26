// public/js/chat.js

// Capturamos los elementos del DOM relacionados con el chat
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');

// 1. EVENTO: Enviar un mensaje
chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita recargar la página [cite: 2]

    const msgText = messageInput.value.trim();

    if (msgText) {
        // Estructuramos los datos del mensaje
        const messageData = {
            username: currentUser, // Viene de auth.js
            room: currentRoom,     // Viene de auth.js
            text: msgText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Emitimos el mensaje al servidor a través de WebSocket
        // 'chatMessage' es el nombre del evento que nuestro server.js está escuchando
        socket.emit('chatMessage', messageData);

        // Limpiamos el input y volvemos a poner el foco en él
        messageInput.value = '';
        messageInput.focus();
    }
});

// 2. EVENTO: Recibir un mensaje del servidor
socket.on('message', (messageData) => {
    outputMessage(messageData);
    
    // Hacemos scroll automático hacia abajo cuando llega un mensaje nuevo
    messageContainer.scrollTop = messageContainer.scrollHeight;
});

// 3. EVENTO: Recibir notificaciones del sistema (ej. alguien se unió)
socket.on('notification', (data) => {
    const div = document.createElement('div');
    div.classList.add('message', 'system-msg');
    div.innerHTML = `<p>${data.message}</p>`;
    messageContainer.appendChild(div);
    messageContainer.scrollTop = messageContainer.scrollHeight;
});

// Función de ayuda para inyectar el mensaje en el HTML
function outputMessage(messageData) {
    const div = document.createElement('div');
    
    // Determinamos si el mensaje es nuestro (enviado) o de otro (recibido)
    if (messageData.username === currentUser) {
        div.classList.add('message', 'sent');
        // Si es nuestro, solo mostramos texto y hora
        div.innerHTML = `<p class="text">${messageData.text}</p>
                         <span class="time" style="font-size: 0.7rem; color: #666; display: block; text-align: right; margin-top: 5px;">${messageData.time}</span>`;
    } else {
        div.classList.add('message', 'received');
        // Si es de otro, mostramos quién lo envió
        div.innerHTML = `<p class="meta" style="font-weight: bold; font-size: 0.8rem; margin-bottom: 5px; color: var(--primary-color);">${messageData.username}</p>
                         <p class="text">${messageData.text}</p>
                         <span class="time" style="font-size: 0.7rem; color: #666; display: block; text-align: right; margin-top: 5px;">${messageData.time}</span>`;
    }

    messageContainer.appendChild(div);
}