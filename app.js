const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let users = {};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle new user joining
    socket.on('new user', (username) => {
        users[socket.id] = username;
        io.emit('user list', Object.values(users));
        socket.broadcast.emit('user joined', username);
    });

    // Broadcast message to all users
    socket.on('chat message', (msg) => {
        const username = users[socket.id];
        io.emit('chat message', { user: username, text: msg });
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        delete users[socket.id];
        io.emit('user list', Object.values(users));
        socket.broadcast.emit('user left', username);
        console.log('User disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

