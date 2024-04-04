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
                socket.option = null; 
                clientSockets.push(socket);
                socket.write("Username accepted.");
                //broadcast(message, socket);
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
                    let recipient = info[1];
                    if (info[1]) {
                        openPrivateChat(senderName, recipient, socket);
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

function broadcast(message, socketSent) {
    //What if here is checked whether the message is sent to everyone or not..
    if (message.toString() === "quit") {
        let index = clientSockets.indexOf(socketSent);
        clientSockets.splice(index, 1);
    } else {
        console.log("sending message..")
        clientSockets.forEach(socket => {
            //if(socket !== socketSent) {
            if (socket !== socketSent && socket.option == "1") {
                socket.write(message);
                //globalChats.push({sender: sender, message: message})
            }
        })
    }
}
function loadPrivateChats(sender, recipientName) {
    let chats = privateChats.filter((msg) => msg.id === sender+recipientName || msg.id === recipientName+sender)
    console.log(chats)
}

function openPrivateChat(senderName, recipientName, senderSocket){
    let recipientSocket = null;
    let firstConnect = true; 
    let chatHistory = null; 
    recipientSocket= findRecipient(recipientName);
    loadPrivateChats(senderName, recipientName);
    //Checking if recipient exists and has chosen option 2
    if (recipientSocket) {
        //Checking if recipient is online, then we can forward messages directly!
        senderSocket.on("data", (data) => {
            chatHistory = loadPrivateChats(senderName, recipientName);
            let text = data.toString("utf-8").trim();
            let tempText = text.split(":");
            let msg = tempText[2];
            let finalMsg = senderName + ": " + msg;
            if (recipientSocket.option === "2") {
                if(firstConnect) {
                    senderSocket.write("You joined private chat where both members of chat are online!");
                    if (chatHistory.length > 0) {
                    chatHistory.forEach((chat) => {
                        senderSocket.write(chat.msg);
                        recipientSocket.write(chat.msg);
                    })
                }
                    firstConnect = false; 
                } else {
                    recipientSocket.write(finalMsg);
                    privateChats.push({id: senderName+recipientName, msg: finalMsg}); 
                }
            } else {
                if(firstConnect) {
                    senderSocket.write("You joined private chat where only you are online, but you can still send messages");
                    firstConnect = false; 
                } else {
                    privateChats.push({id: senderName+recipientName, msg: finalMsg}); 
                }
            }
        })
        
    } 
    else {
        senderSocket.write("Recipient not found, cannot open private chat");
    }
    
}


function closeClientConnection(socket) {
    let index = clientSockets.indexOf(socket);
    if (index != -1) {
        //client exists, we can delete it from usernames
        clientNames.splice(index, 1);
        clientSockets.splice(index, 1);
        console.log('A client left.');

    }
}