//Based on this: https://www.youtube.com/watch?v=4yPnp4k8VMA
//This program is based on this tutorial by WittCode: https://www.youtube.com/watch?v=-rVxORKWzv0

const net = require('node:net');
const readLine = require('node:readline').createInterface({
    input: process.stdin, 
    output: process.stdout
})
let waitForUsername;
let usernameAccepted = false; 
waitForUsername = new Promise((resolve) => {
    readLine.question("Give username to enter chat (if name is already taken, connection is closed): ", username => {
        resolve(username)
    });  
})

waitForUsername.then((username) => {
    const socket = net.createConnection({
        port: 8000,
        host: process.argv[2] ?? "localhost"
    });

    socket.on('connect', () => {
        socket.write(`${username} has joined the chat.`);
        console.log("Your options:")
        console.log("1) Join global chat to send messages to everyone")
        console.log("2) Send private messages to someone")
        console.log("0) Close the chat")
        console.log("Write number of your choice anytime in the chat")
    });
    let option = null; 
    readLine.on('line', data => {
        if (data === "1") {
            option = 1;
            console.log("Joining global chat")
        } else if(data === "2") {
            option = 2;
            console.log("Starting private chat");
            //socket.write("2");
        } else if(data === "0") {
            option = 0; 
        }
        if (option == 1) {
            socket.write(`1-${username}: ${data}`)
        } else if(option == 2) {
            socket.write(`2-${username}: ${data}`)
            const waitForRecipientName = new Promise((resolve) => {
                readLine.question("Send your message in form: recipient: your message", recipient => {
                    resolve(recipient)
                });
            })
            waitForRecipientName.then((recipient) =>
                socket.write(`2-${username}:${recipient}`)
            )
        } else if (option == 0) {
            socket.write(`${username} has left the chat.`)
            socket.setTimeout(1000);
        }
        //socket.write(`${username}: ${data}`)
    })

    socket.on('data', data => {
        //Showing messages only if the user has joined some chat.. (HEH EI TOIMI :D)
        if (data === "Username accepted.") {
            usernameAccepted = true;
        }
        console.log("\n%s", data) 
        
        
        //console.log("\n%s", data)
    })

    socket.on('end', () => {
        process.exit();
    })

    socket.on('timeout', () => {
        socket.write("0");
        socket.end();
    })


    socket.on('error', () => {
        console.log("Shutting down due error");
    })


    
})







/*
waitForUsername.then(username => {
    const socket = net.connect({
        port: 8000,
        host: process.argv[2] ?? "localhost"
    })
    socket.write(username);
    socket.on("data", (data) => {
        console.log("\n%s", data);
        if (data.toString() === "Name is taken, try again") {
            new Promise(resolve => {
                readLine.question("Give username to enter chat: ");
            })
        }
    })
})
*/
//Connecting to ip address given by client: https://cs.lmu.edu/~ray/notes/jsnetexamples/
/*waitForUsername.then(username => {
    const socket = net.connect({
        port: 8000,
        host: process.argv[2] ?? "localhost"
    });
    socket.on("connect", () => {
        let text = username + " has joined the chat.";
        socket.write(text);
        /*console.log("What do you want to do?")
        console.log("1) Send message to everyone")
        console.log("2) Send private message to someone")
        console.log("0) Quit")*/
    /*})
    readLine.on('line', data => {
        let choice = null;
        let text; 
        /*if (data === "1") {
            console.log("Opening global chat..")
            choice = 1;
            text = choice.toString() + ":" + username + ": " + data
        } else if(data === "2") {
            console.log("Who you want to send message to?")
            const waitForRecipientName = new Promise(resolve => {
                readLine.question("Give name who you want to sent message to: ", name => {
                    resolve(name)
                })
            })
            waitForRecipientName.then(name => {
                socket.write(name)
            })
        } else if(data === 0) {
            let text = username +  " has left the chat.";
            socket.write(text);
            socket.setTimeout(1000);
        }
        //socket.write(text);
    })
    socket.on('data', data => {
        console.log("\n%s", data);
        if (data.toString() === "Username is taken. Try again") {
            console.log("Ask for username again..");
        }
    })

    socket.on('timeout', () => {
        socket.write('quit');
        socket.end();
    });

    socket.on('end', () => {
        process.exit();
    })


    socket.on('error', () => {
        console.log("Shutting down due error");
    })
})
*/