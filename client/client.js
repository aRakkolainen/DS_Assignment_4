//Based on this: https://www.youtube.com/watch?v=4yPnp4k8VMA
//This program is based on this tutorial by WittCode: https://www.youtube.com/watch?v=-rVxORKWzv0

const net = require('node:net');
const readLine = require('node:readline').createInterface({
    input: process.stdin, 
    output: process.stdout
})

const waitForUsername = new Promise(resolve => {
    readLine.question("Give your username to enter chat: ", username => {
        resolve(username)
    });
})



waitForUsername.then(username => {
    const socket = net.connect({
        port: 8000
    });
    socket.on("connect", () => {
        let text = username + " has joined the chat.";
        socket.write(text);
    })
    const waitForDecision = new Promise(resolve => {
        console.log("What do you want to do?")
        console.log("1) Send message to everyone")
        console.log("2) Send private message to someone")
        console.log("0) Quit")
        readLine.question("Give your choice: ", choice => {
            resolve(choice)
        })
    })

    waitForDecision.then(choice => {
        if (choice === "1") {
            console.log("Sending message to everyone");
            readLine.on('line', data => {
                let text = username + ": " + data; 
                socket.write(text);
            })
        } else if (choice === "2") {
            const waitForRecipientName = new Promise(resolve => {
                readLine.question("Give name who you want to sent message to: ", name => {
                    resolve(name)
                })
            })

            waitForRecipientName.then(name => {
                socket.write(name)
            })
        } else if(choice === "0") {
            let text = username +  " has left the chat.";
            readLine.on('line', data => {
                socket.write(text);
                socket.setTimeout(1000);
            })
        }
    })
        /*readLine.on('line', data => {
            if(data === 'quit') {
                let text = username +  " has left the chat.";
                socket.write(text);
                socket.setTimeout(1000);
            } else {
                let text = username + ": " + data; 
                socket.write(text);
            }
        })*/


    socket.on('data', data => {
        console.log("%s", data);
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

/*const client = net.createConnection(options, () => {
    console.log('connected to server!');
    client.write('hello\r\n');
})

client.on('data', (data) => {
    //onsole.log(data.toString());
    client.end();
})*/