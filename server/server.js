//Based on this tutorial: https://tnickel.de/2020/03/29/2020-03-nodejs-http-server-using-the-net-module/
// Hint: https://www.youtube.com/watch?v=4yPnp4k8VMA
//This program is based on this tutorial by WittCode: https://www.youtube.com/watch?v=-rVxORKWzv0
// and the documentation of Node.js

const net = require('node:net');
let sockets = [];

const server = net.createServer((socket) => {
    sockets.push(socket);
    console.log("New client connected");
    socket.on('data', data =>{
        broadcast(data, socket);
        let text = data.toString(); 
        let user = text.split(" ");
        sockets[sockets.indexOf(socket)].name = user[0];
    })
    socket.on('error', err =>  {
        console.log("A client has disconnected");
    })

    socket.on('end', () => {
        console.log('A client left.');
    })
})
server.listen(8000, () => {
    console.log("Listening to port 8000");
});

function broadcast(message, socketSent) {
    if (message.toString() === "quit") {
        let index = sockets.indexOf(socketSent);
        sockets.splice(index, 1);
    } else {
        sockets.forEach(socket => {
            //if(socket !== socketSent) {
            if (socket != socketSent) socket.write(message);
        })
    }
}


function sendPrivateChat(message, socketSent, socketReceiver){
    sockets.forEach(socket => {
        console.log(socket.name)
    })
}