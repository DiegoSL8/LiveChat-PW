// server/server.js

// 1. Importación de módulos necesarios
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Importamos Socket.IO
const path = require('path');

// 2. Inicialización de la aplicación Express y el servidor HTTP
const app = express();
const server = http.createServer(app);

// 3. Configuración de Socket.IO sobre nuestro servidor HTTP
const io = new Server(server, {
    cors: {
        origin: "*", // En etapa de desarrollo permitimos cualquier origen
        methods: ["GET", "POST"]
    }
});

// 4. Middleware: Sirviendo la carpeta 'public' para el Frontend
// Esto le dice a Node que cualquier archivo estático (HTML, CSS, JS del cliente) se buscará allí.
app.use(express.static(path.join(__dirname, '../public')));

// 5. Lógica central de WebSockets (Comunicación en tiempo real)
io.on('connection', (socket) => {
    // Este evento se dispara cada vez que un usuario abre la página
    console.log(`[+] Nuevo usuario conectado: ${socket.id}`);

    // ==========================================
    // EVENTO: UNIRSE A UNA SALA
    // ==========================================
    socket.on('joinRoom', ({ username, room }) => {
        // Guardamos el nombre y la sala en la sesión de este socket para saber quién es cuando se desconecte
        socket.username = username;
        socket.room = room;

        // socket.join(room) agrupa a los usuarios en "habitaciones" separadas
        socket.join(room);
        console.log(`[ROOM] ${username} se unió a la sala: ${room}`);

        // Notificamos a todos en esa sala (EXCEPTO al que acaba de entrar) que alguien nuevo llegó
        socket.to(room).emit('notification', {
            type: 'join',
            message: `${username} se ha unido a la sala.`
        });
    });

    // ==========================================
    // EVENTO: RECIBIR Y RETRANSMITIR MENSAJES (¡Esto faltaba!)
    // ==========================================
    socket.on('chatMessage', (messageData) => {
        // io.to().emit retransmite el mensaje a TODOS los miembros de la sala (incluyendo al que lo envió)
        io.to(messageData.room).emit('message', messageData);
    });

    // ==========================================
    // EVENTO: DESCONEXIÓN Y ABANDONO DE SALA
    // ==========================================
    socket.on('disconnect', () => {
        console.log(`[-] Usuario desconectado: ${socket.id}`);
        
        // Si el usuario ya se había unido a una sala antes de irse, notificamos a los demás
        if (socket.username && socket.room) {
            io.to(socket.room).emit('notification', {
                type: 'leave',
                message: `${socket.username} ha abandonado la sala.`
            });
        }
    });
});

// 6. Levantando el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor en línea. Ingresa a http://localhost:${PORT}`);
});