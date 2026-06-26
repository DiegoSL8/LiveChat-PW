# Chat en Tiempo Real - WebSockets (Actividad 3.3)

Este proyecto es una aplicación web de mensajería en tiempo real desarrollada con **Node.js, Express y Socket.IO**. Permite a los usuarios conectarse a diferentes salas temáticas, intercambiar mensajes de texto, enviar emojis, compartir archivos y mantener un historial local de sus conversaciones.

## Características Implementadas (Features)

- **Salas Temáticas:** Los usuarios pueden unirse a salas específicas (General, Videojuegos, Estudios, Tecnología).
- **Comunicación Bidireccional:** Mensajería instantánea sin recarga de página gracias a WebSockets.
- **Soporte Multimedia:** Envío de imágenes y documentos adjuntos mediante conversión a Base64.
- **Integración de Emojis:** Panel de emojis nativo utilizando la biblioteca `js-emoji`.
- **Notificaciones del Sistema:** Alertas visuales y sonoras cuando un usuario entra, sale o envía un mensaje.
- **Persistencia de Datos:** El historial de chat se guarda en el `localStorage` del navegador del cliente.
- **Búsqueda en Vivo:** Filtrado dinámico de mensajes pasados en la sala actual.
- **Scroll Infinito:** Carga progresiva de mensajes antiguos almacenados al subir en la ventana de chat.

## 🛠️ Tecnologías Utilizadas

**Frontend:**
- HTML5 & CSS3 (Diseño responsivo y modular).
- JavaScript (Vanilla JS) dividido en módulos (`auth.js`, `chat.js`, `utils.js`, `socket.js`).
- [js-emoji](https://github.com/iamcal/js-emoji) (Biblioteca para renderizado de shortcodes a emojis).

**Backend:**
- Node.js
- Express.js (Servidor HTTP y de archivos estáticos).
- Socket.IO (Motor de WebSockets).

## ⚙️ Instalación y Ejecución

1. Clona este repositorio en tu máquina local.
2. Abre una terminal en la raíz del proyecto.
3. Instala las dependencias necesarias ejecutando:

   ``` BASH

   npm install
   npm init -y
   npm install express socket.io 
   
   /iniciar servidor

   node server/server.js 
