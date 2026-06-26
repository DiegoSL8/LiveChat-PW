// public/js/auth.js

// =========================================
// 1. LÓGICA DE AUTENTICACIÓN Y VISTAS
// =========================================

// Variables globales para usarlas luego con Socket.IO y otros scripts
let currentUser = '';
let currentRoom = '';

const loginForm = document.getElementById('login-form');
const loginView = document.getElementById('login-view');
const chatView = document.getElementById('chat-view');
const roomNameDisplay = document.getElementById('current-room-name');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario

    // Capturamos los datos ingresados
    currentUser = document.getElementById('username').value.trim();
    currentRoom = document.getElementById('room-select').value;

    if (currentUser && currentRoom) {
        // Ocultamos la pantalla de login y mostramos el chat
        loginView.classList.add('hidden');
        chatView.classList.remove('hidden');

        // Actualizamos el nombre de la sala en la cabecera del chat
        const roomFormatted = currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1);
        roomNameDisplay.innerText = `Sala: ${roomFormatted}`;

        console.log(`Usuario ${currentUser} conectado a la sala ${currentRoom}`);
        
        // =========================================
        // CONEXIÓN WEB-SOCKET E HISTORIAL (AQUÍ ESTÁ LA MAGIA)
        // =========================================
        
        // 1. Le avisamos al servidor que nos unimos a esta sala
        socket.emit('joinRoom', { username: currentUser, room: currentRoom });

        // 2. Limpiamos el contenedor de mensajes por si había cosas de una sesión anterior
        const msgContainer = document.getElementById('message-container');
        if(msgContainer) msgContainer.innerHTML = '';

        // 3. Cargamos el historial guardado en localStorage (Esta función vive en utils.js)
        if (typeof loadRoomHistory === 'function') {
            loadRoomHistory(currentRoom);
        }
    }
});

// =========================================
// 2. INTEGRACIÓN DE BIBLIOTECA JS-EMOJI
// =========================================

// Inicializamos la librería (basado en la documentación de js-emoji)
const emojiConvertor = new EmojiConvertor();
emojiConvertor.replace_mode = 'unified';
emojiConvertor.allow_native = true;

// Creamos una lista básica de shortcodes de emojis
const basicEmojis = [':smile:', ':laughing:', ':wink:', ':heart:', ':thumbsup:', ':fire:', ':sob:', ':sweat_smile:'];

// Construimos un pequeño "panel" selector de emojis dinámicamente
const emojiPicker = document.createElement('div');
emojiPicker.id = 'emoji-picker';
emojiPicker.classList.add('hidden');

// Estilos directos para el panel de emojis
Object.assign(emojiPicker.style, {
    position: 'absolute',
    bottom: '70px',
    background: '#ffffff',
    border: '1px solid #dddddd',
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    gap: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
});

// Llenamos el panel con los emojis convertidos
const messageInput = document.getElementById('message-input');

basicEmojis.forEach(shortcode => {
    const span = document.createElement('span');
    // Convertimos el texto a un emoji visual nativo
    span.innerHTML = emojiConvertor.replace_colons(shortcode); 
    span.style.cursor = 'pointer';
    span.style.fontSize = '1.5rem';
    
    // Evento para agregar el emoji al input de texto
    span.addEventListener('click', () => {
        messageInput.value += span.innerHTML;
        messageInput.focus(); 
        emojiPicker.classList.add('hidden'); 
    });
    
    emojiPicker.appendChild(span);
});

// Agregamos el panel justo dentro de la zona de escritura (footer)
document.querySelector('.chat-input-area').appendChild(emojiPicker);

// Evento para el botón del emoji: Mostrar/Ocultar el panel
const btnEmoji = document.getElementById('btn-emoji');
btnEmoji.addEventListener('click', () => {
    emojiPicker.classList.toggle('hidden');
});