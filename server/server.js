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
        // Guardamos el nombre y la sala en la sesión de este socket 
        socket.username = username;
        socket.room = room;

        // Agrupamos al usuario en la "habitación" correspondiente
        socket.join(room);
        console.log(`[ROOM] ${username} se unió a la sala: ${room}`);

        // Notificamos a todos en esa sala (EXCEPTO al que acaba de entrar)
        socket.to(room).emit('notification', {
            type: 'join',
            message: `${username} se ha unido a la sala.`
        });

        // Contamos cuántos usuarios hay en la sala y enviamos el número actualizado a TODOS
        const roomUsers = io.sockets.adapter.rooms.get(room)?.size || 0;
        io.to(room).emit('roomUsers', roomUsers);
    });

    // ==========================================
    // EVENTO: RECIBIR Y RETRANSMITIR MENSAJES
    // ==========================================
    socket.on('chatMessage', (messageData) => {
        // Retransmitimos el mensaje a TODOS los miembros de la sala
        io.to(messageData.room).emit('message', messageData);
    });

    // ==========================================
    // EVENTO: DESCONEXIÓN Y ABANDONO DE SALA
    // ==========================================
    socket.on('disconnect', () => {
        console.log(`[-] Usuario desconectado: ${socket.id}`);
        
        // Si el usuario ya se había unido a una sala antes de irse, notificamos y actualizamos
        if (socket.username && socket.room) {
            // Avisar que se fue
            socket.to(socket.room).emit('notification', {
                type: 'leave',
                message: `${socket.username} ha abandonado la sala.`
            });

            // Actualizamos el contador de usuarios para los que se quedan en la sala
            const roomUsers = io.sockets.adapter.rooms.get(socket.room)?.size || 0;
            io.to(socket.room).emit('roomUsers', roomUsers);
        }
    });
});

// 6. Levantando el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor en línea. Ingresa a http://localhost:${PORT}`);
});