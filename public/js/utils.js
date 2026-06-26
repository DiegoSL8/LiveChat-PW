// public/js/utils.js

// ==========================================
// 1. ALMACENAMIENTO DE HISTORIAL EN LOCALSTORAGE
// ==========================================

// Guardamos cada nuevo mensaje en el localStorage del navegador
function saveMessageToHistory(messageData) {
    // Obtenemos el historial actual de la sala, si no existe, creamos un array vacío
    const historyKey = `chatHistory_${messageData.room}`;
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];

    // Agregamos el nuevo mensaje al array
    history.push(messageData);

    // Guardamos nuevamente el array actualizado en localStorage
    localStorage.setItem(historyKey, JSON.stringify(history));
}

// Cargamos los mensajes anteriores al entrar a una sala
function loadRoomHistory(roomName) {
    const historyKey = `chatHistory_${roomName}`;
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];

    // Mostramos solo los últimos 50 mensajes inicialmente para el "scroll infinito"
    const messagesToShow = history.slice(-50); 

    messagesToShow.forEach(msg => {
        // Reutilizamos la función 'outputMessage' que creaste en chat.js
        if(typeof outputMessage === 'function') {
            outputMessage(msg, true); // true indica que es historial, podrías usarlo para estilos
        }
    });
}

// ==========================================
// 2. BÚSQUEDA EN EL HISTORIAL
// ==========================================

// Para esto necesitamos agregar un input de búsqueda dinámicamente o pedirle al desarrollador A que lo ponga.
// Aquí lo inyectaremos dinámicamente en la cabecera del chat.
const chatHeader = document.querySelector('.chat-header');
if (chatHeader) {
    const searchContainer = document.createElement('div');
    searchContainer.innerHTML = `
        <input type="text" id="search-history" placeholder="Buscar mensaje..." style="padding: 5px; border-radius: 5px; border: 1px solid #ccc; font-size: 0.8rem;">
    `;
    chatHeader.insertBefore(searchContainer, chatHeader.lastElementChild);

    const searchInput = document.getElementById('search-history');
    
    // Escuchamos lo que el usuario escribe
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const messagesNodes = document.querySelectorAll('#message-container .message:not(.system-msg)');

        // Ocultamos o mostramos los mensajes en el DOM según si coinciden con la búsqueda
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
// 3. SCROLL INFINITO
// ==========================================

// En un proyecto real, el scroll infinito pide más datos al servidor[cite: 51].
// Aquí simularemos el scroll infinito recuperando mensajes ocultos del localStorage.
let currentMessageOffset = 50; 

const msgContainer = document.getElementById('message-container');

if (msgContainer) {
    msgContainer.addEventListener('scroll', () => {
        // Detectamos si el usuario hizo scroll hasta el tope del contenedor
        if (msgContainer.scrollTop === 0) {
            
            const historyKey = `chatHistory_${currentRoom}`;
            const history = JSON.parse(localStorage.getItem(historyKey)) || [];
            
            // Si aún hay mensajes viejos en el historial que no hemos mostrado
            if (currentMessageOffset < history.length) {
                
                // Extraemos el siguiente bloque de 50 mensajes antiguos
                const nextBatch = history.slice(-currentMessageOffset - 50, -currentMessageOffset);
                currentMessageOffset += 50;

                // Guardamos la altura actual para mantener la posición del scroll
                const previousHeight = msgContainer.scrollHeight;

                // Prepend (agregamos al inicio) los mensajes antiguos
                nextBatch.reverse().forEach(msg => {
                   prependMessage(msg);
                });

                // Ajustamos el scroll para que el usuario no salte bruscamente
                msgContainer.scrollTop = msgContainer.scrollHeight - previousHeight;
            }
        }
    });
}

// Función auxiliar para agregar mensajes al principio (usada por el scroll infinito)
function prependMessage(messageData) {
    const div = document.createElement('div');
    
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
    
    // Lo insertamos al inicio del contenedor
    msgContainer.insertBefore(div, msgContainer.firstChild);
}