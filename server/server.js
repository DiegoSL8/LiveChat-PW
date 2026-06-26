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

    // Evento personalizado: Un usuario solicita unirse a una sala
    socket.on('joinRoom', ({ username, room }) => {
        // socket.join(room) es una función nativa de Socket.IO para agrupar usuarios
        socket.join(room);
        console.log(`[ROOM] ${username} se unió a la sala: ${room}`);

        // Notificamos a todos en esa sala (EXCEPTO al que acaba de entrar) que alguien nuevo llegó
        socket.to(room).emit('notification', {
            type: 'join',
            message: `${username} se ha unido a la sala ${room}.`
        });
    });

    // Evento nativo: El usuario cierra la pestaña o pierde conexión
    socket.on('disconnect', () => {
        console.log(`[-] Usuario desconectado: ${socket.id}`);
    });
});

// 6. Levantando el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor en línea. Ingresa a http://localhost:${PORT}`);
});