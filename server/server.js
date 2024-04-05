//Based on this tutorial: https://tnickel.de/2020/03/29/2020-03-nodejs-http-server-using-the-net-module/
//Help is taken from this tutorial on how to implement TCP in Node.js by Engineer Man: https://www.youtube.com/watch?v=4yPnp4k8VMA
//This program is based on this tutorial by WittCode: https://www.youtube.com/watch?v=-rVxORKWzv0
//Server is partially based on this ChatServer tutorial: https://cs.lmu.edu/~ray/notes/jsnetexamples/
// and the documentation of Node.js

const net = require('node:net');
let clientSockets = [];
let clientNames = [];
//Based on WittCode example: https://www.youtube.com/watch?v=-rVxORKWzv0
const server = net.createServer((socket) => {
    console.log("New client connected");
    let option = null; 
    let firstTime = false; 
    socket.on('data', (data) =>{
        const message = data.toString("utf-8").trim();
        //splitting the username part
        //Checking if name is already defined and is it already reserved to be this specific one
        socket.name = null;
        if (message.includes("has joined the chat.")) {
            let user = message.split(" ");
            let username = user[0];
            if (clientNames.includes(username)) {
                socket.write("Username is taken.")
            } else {
                clientNames.push(username);
                socket.option = null; 
                socket.name = username;
                clientSockets.push(socket);
                socket.write("Username accepted.");
            }
        } else {
            let content = message.split("-");
            let username = null; 
            option = content[0];    
            switch(option) {
                case "1":
                    socket.option = "1";
                    let user = content[1].split(":");
                    username = user[0];
                    let messageText = content[1];
                    if (!content[1].includes(": 1") && firstTime == false){
                        broadcast(`${username} has joined the chat.`, socket);
                        broadcast(messageText, socket);
                        firstTime = true;
                    } else if(firstTime == true) {
                        broadcast(messageText, socket);
                    }
                    break; 
                case "2":
                    let info = content[1].split(":");
                    socket.option="2";
                    let senderName = info[0];
                    let recipientName = info[1];
                    let recipientSocket = null; 
                    if (info[1]) {
                        recipientSocket = findRecipient(recipientName);
                        let msg = info[2];
                        if (recipientSocket) {
                            if(msg !== "") {
                                console.log("sending message..");
                                sendPrivateChat(msg, senderName, socket, recipientSocket);
                            }
                        } else {
                            socket.write("Client not connected, wait for connection or choose other option!")
                        }
                    }
                    break;
                case "0":
                    if (message.includes("has left the chat.")) {
                        let info = content[1].split(" ");
                        username = info[0];
                        socket.write(`${username} has left the chat.`);
                        closeClientConnection(socket)
                    }
                    
                }
        }
    })
    socket.on('error', err =>  {
        console.log("A client has disconnected due error: " + err);
    })

    socket.on('end', () => closeClientConnection(socket))

})
server.listen(8000, () => {
    console.log("Listening to port 8000");
});


function findRecipient(recipientName) {
    if (recipientName && recipientName !== "2") {
        let recipientIndex = clientNames.indexOf(recipientName); 
        if (recipientIndex == -1) {
            return null;
        } else {
            return clientSockets[recipientIndex]
    }
    }

}
//Based on WittCode example: https://www.youtube.com/watch?v=-rVxORKWzv0 and this is used to sent message to everyone connected to global chat
function broadcast(message, socketSent) {
    //What if here is checked whether the message is sent to everyone or not..
    if (message.toString() === "quit") {
        let index = clientSockets.indexOf(socketSent);
        clientSockets.splice(index, 1);
    } else {
        console.log("sending message..")
        clientSockets.forEach(socket => {
            if (socket !== socketSent && socket.option == "1") {
                socket.write(message);
            }
        })
    }
}

//Partially based on this ChatServer tutorial: https://cs.lmu.edu/~ray/notes/jsnetexamples/
function sendPrivateChat(message, senderName, senderSocket, recipientSocket){
    //Checking if recipient has chosen option 2 (Currently it is possible only send messages if both client have opened the private chat)
    if(recipientSocket.option == "2" && message !== "2") {
        clientSockets.forEach(socket => {
            //if(socket !== socketSent) {
            if (socket !== senderSocket && socket.option == "2" && socket == recipientSocket) {
                socket.write(senderName + ": " + message);
            }
        })
    }
}

function closeClientConnection(socket) {
    let index = clientSockets.indexOf(socket);
    if (index != -1) {
        //client exists, we can delete it from usernames and sockets
        clientNames.splice(index, 1);
        clientSockets.splice(index, 1);
        console.log('A client left.');

    }
}