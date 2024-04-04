//Based on this tutorial: https://tnickel.de/2020/03/29/2020-03-nodejs-http-server-using-the-net-module/
// Hint: https://www.youtube.com/watch?v=4yPnp4k8VMA
//This program is based on this tutorial by WittCode: https://www.youtube.com/watch?v=-rVxORKWzv0
//Server is based on this ChatServer tutorial: https://cs.lmu.edu/~ray/notes/jsnetexamples/
// and the documentation of Node.js

const net = require('node:net');
let clientSockets = [];
let clientNames = [];
let globalChats = [];
let privateChats = []; 


const server = net.createServer((socket) => {
    //socket.write("Give your username to enter the chat: ");
    console.log("New client connected");
    let client = null;
    let recipient = null;
    let option = null; 
    let firstTime = false; 
    socket.on('data', (data) =>{
        const message = data.toString("utf-8").trim();
        //splitting the username part
        //Checking if name is already defined and is it already reserved to be this specific one
        if (message.includes("has joined the chat.")) {
            let user = message.split(" ");
            let username = user[0];
            if (clientNames.includes(username)) {
                socket.write("Username is taken.")
            } else {
                clientNames.push(username);
                clientSockets.push(socket);
                socket.write("Username accepted.");
                //broadcast(message, socket);
            }
        } else {
            let content = message.split("-");
            let user = content[1].split(":");
            let username = user[0];
            let messageText = content[1];
            option = content[0];
            //let sender = content[1];
            //console.log(content[0]);
            //broadcast(`${username} has joined the chat.`, socket);
            
            switch(option) {
                case "1":
                    if (!content[1].includes(": 1") && firstTime == false){
                        broadcast(`${username} has joined the chat.`, socket);
                        broadcast(messageText, socket);
                        firstTime = true;
                    } else if(firstTime == true) {
                        broadcast(messageText, socket);
                    }
                    break; 
                case "2":
                    let contentInfo = message.split(":");
                    let sender = contentInfo[0].split("-")
                    let senderName = sender[1]; 
                    let recipient = contentInfo[1]; 
                    let text = senderName + ": " + contentInfo[2];
                    sendPrivateChat(text, socket, recipient);
                    break;
                case "0":

                }
            
            

        }
    })
    socket.on('error', err =>  {
        console.log("A client has disconnected");
    })

    socket.on('end', () => {
        console.log('A client left.');
        clientNames.delete(username);
        clientSockets.delete(socket);
    })
})
server.listen(8000, () => {
    console.log("Listening to port 8000");
});

/*function giveOptions() {
    
}*/


function findRecipient(recipientName) {
    console.log(recipientName);
    if (recipientName && recipientName !== "2") {
        let recipientIndex = clientNames.indexOf(recipientName); 
        if (recipientIndex == -1) {
        return null;
    } else {
        return clientSockets[recipientIndex]
    }
    }

}

function broadcast(message, socketSent) {
    //What if here is checked whether the message is sent to everyone or not..
    if (message.toString() === "quit") {
        let index = clientSockets.indexOf(socketSent);
        clientSockets.splice(index, 1);
    } else {
        console.log("sending message..")
        clientSockets.forEach(socket => {
            //if(socket !== socketSent) {
            if (socket !== socketSent) {
                socket.write(message);
                //globalChats.push({sender: sender, message: message})
            }
        })
    }
}


function sendPrivateChat(message, senderSocket, recipientName){
    let recipientSocket = null;
    recipientSocket= findRecipient(recipientName);
    console.log(recipientSocket);
    if (recipientSocket) {
        recipientSocket.write(message);
    } else {
        senderSocket.write("Recipient not found!");
    }
}