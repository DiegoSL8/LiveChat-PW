/**
 * public/js/socket.js
 * Configuración inicial del cliente de Socket.IO.
 * Declaramos 'socket' globalmente para que otros scripts (auth.js y chat.js) puedan usarlo luego.
 */

// Iniciamos la conexión. Como el cliente y el servidor están en el mismo origen (localhost:3000),
// no necesitamos pasarle una URL específica dentro del paréntesis.
const socket = io();

// Evento nativo para confirmar que nos conectamos exitosamente al servidor
socket.on('connect', () => {
    console.log('✅ Conexión WebSocket establecida con ID:', socket.id);
});

// Evento para capturar y mostrar errores de conexión si el servidor se cae
socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión al servidor:', error.message);
});