const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server , {connectionStateRecovery:{}});

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile('./index.html')
});

const users = {}

io.on('connection', (socket) => {
  // console.log('a user connected');
  socket.on('new-user' , name => {
    users[socket.id] =name
    socket.broadcast.emit('user-connected' , name)
    console.log('user-connected : ' , name)
  } )
  socket.on('chat message' , (msg) => {
    console.log("message :  " + msg)
    io.emit('chat message', {msg:msg , name:users[socket.id]});
    //socket.broadcast.emit(msg)
  })

  //disconnect

  socket.on('disconnect' , () =>{
    socket.broadcast.emit('userDisconnected' , users[socket.id])
    delete users[socket.id]
  })


  //typing status
socket.on('typing' , (isTyping) => {
  io.emit('typing' , {username:users[socket.id]  , isTyping})
})


});



server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});