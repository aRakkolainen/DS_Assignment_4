//Based on this: https://www.youtube.com/watch?v=4yPnp4k8VMA
// Multiple chats is based on this: https://www.youtube.com/watch?v=-rVxORKWzv0

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
        //let text = username + " has joined the chat.";
        socket.write(username);
    })

    readLine.on('line', data => {
        if(data === 'quit') {
            let text = username +  " has left the chat.";
            socket.write(text);
            socket.setTimeout(1000);
        } else {
            let text = username + ":" + data; 
            socket.write(text);
        }
    })

    socket.on('data', data => {
        console.log(data);
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