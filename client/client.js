//Help is taken from this tutorial on how to implement TCP in Node.js by Engineer Man: https://www.youtube.com/watch?v=4yPnp4k8VMA
//This program is based on this tutorial by WittCode: https://www.youtube.com/watch?v=-rVxORKWzv0

const net = require('node:net');
const readLine = require('node:readline').createInterface({
    input: process.stdin, 
    output: process.stdout
})
let waitForUsername;
//Based on WittCode example
waitForUsername = new Promise((resolve, reject) => {
    readLine.question("Give username to enter chat (if name is already taken, connection is closed): ", username => {
        resolve(username)
    });  
})

//Based on WittCode example
waitForUsername.then((username) => {
    const socket = net.createConnection({
        port: 8000,
        host: process.argv[2] ?? "localhost"
    });

    socket.on('connect', () => {
        socket.write(`${username} has joined the chat.`);
    });
    let option = null; 
    let waitForRecipientName;
    readLine.on('line', async (data) => {
        if (data === "1") {
            option = 1;
            console.log("Joining global chat")
        } else if(data === "2") {
            option = 2;
            //console.log("Starting private chat");
            waitForRecipientName = new Promise((resolve) => {
                readLine.question("Enter the name of person you want to send private message: ", recipient => {
                    resolve(recipient)
                });
            })
        } else if(data === "0") {
            option = 0; 
        }
        if (option == 1) {
            socket.write(`1-${username}: ${data}`)
        } else if(option == 2) {
            //socket.write(`2-${username}: ${data}`)
            waitForRecipientName.then((recipient) => { 
                socket.write(`2-${username}:${recipient}:${data}`)
            })
        } else if (option == 0) {
            socket.write(`0-${username} has left the chat.`)
            socket.setTimeout(1000);
        }
    })
    let usernameAccepted = false; 
//Based on WittCode example
    socket.on('data', data => {
        if (data.toString() === "Username accepted.") {
            console.log("Welcome!") 
            usernameAccepted = true; 
            console.log("Your options:")
            console.log("1) Join global chat to send messages to everyone")
            console.log("2) Send private messages to someone")
            console.log("0) Close the chat")
            console.log("Write number of your choice anytime in the chat")
        } else if(data.toString() === "Username is taken.") {
            console.log("\n%s", data);
            console.log("Username is taken, closing connection..");
            option = 0;       
        }

        if(usernameAccepted) {
            console.log("\n%s", data) 
        }
    })
//Based on WittCode example
    socket.on('end', () => {
        process.exit();
    })
//Based on WittCode example
    socket.on('timeout', () => {
        socket.write("0");
        socket.end();
    })
//Based on WittCode example
    socket.on('error', () => {
        socket.write("0");
        console.log("Shutting down due error");
    }) 
})