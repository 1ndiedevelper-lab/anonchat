const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  let userNick = '';

  socket.on('join', (nick) => {
    if (!nick || users.includes(nick)) {
      socket.emit('nickname error', 'Nick jest zajęty lub nieprawidłowy');
      return;
    }
    userNick = nick;
    users.push(nick);
    io.emit('user list', users);
    console.log(`${nick} dołączył do czatu`);
  });

  socket.on('chat message', (msg) => {
    if (!msg || !msg.user || !msg.text) return;
    io.emit('chat message', msg);
    console.log(`Wiadomość od ${msg.user}: ${msg.text}`);
  });

  socket.on('disconnect', () => {
    if (userNick) {
      users = users.filter(u => u !== userNick);
      io.emit('user list', users);
      console.log(`${userNick} opuścił czat`);
    }
  });
});

http.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
});
