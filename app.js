const express = require('express');
const app = express();
const http = require('http');
const socket = require('socket.io');
const path = require('path');

const server = http.createServer(app);
const io = socket(server);

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,"public")));

io.on("connection",function(socket){
    socket.emit("your-id", socket.id);
    socket.on("send-location",function(data){
        io.emit("recieve-location",{id: socket.id,...data});
    })
    socket.on("disconnect",function(){
    io.emit("user-disconnected",socket.id);
})
})

app.get('/',(req,res)=>{
    res.render("index");
})

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
