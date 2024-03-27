//Based on this tutorial: https://tnickel.de/2020/03/29/2020-03-nodejs-http-server-using-the-net-module/
// Hint: https://www.youtube.com/watch?v=4yPnp4k8VMA
// Multi client chat is based on this: https://www.youtube.com/watch?v=-rVxORKWzv0
// and the documentation of Node.js

const net = require('node:net');
let sockets = [];

const server = net.createServer((socket) => {
    //socket.write('HTTP/1.1 200 OK\n\nhello world')
    //socket.end((err) => console.log(err))
    sockets.push(socket);
    console.log("New client connected");
    socket.on('data', data =>{
        broadcast(data, socket);
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
        console.log(message.toString());
        sockets.forEach(socket => {
            //if(socket !== socketSent) {
            if (socket != socketSent) console.log(socket.write(message));
        })
    }
}