var net = require('net');
const { exec } = require('child_process');
const { BRIDGE_PORT, HTML_PORT, SSH_PORT, ID } = process.env;

let proxy = net.createServer(socket => {
    var client;
    var isFirst = true;

    socket.on('data', data => {
        if (!isFirst) return;
        isFirst = false;
        var str = data.toString()
        var port = str.includes('SSH-2.0-OpenSSH') ? SSH_PORT : HTML_PORT;

        client = net.connect(port);
        client.write(data)
        socket.pipe(client).pipe(socket);
    })
    socket.on('error', e => console.error(e));
})


proxy.listen(BRIDGE_PORT);
runSSH();

function runSSH() {
    let id = parseInt(ID || 99, 10);
    let cmd = `/usr/bin/ssh -NR ${5000 + id}:localhost:4000 -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=no -o ServerAliveInterval=120 -o ServerAliveCountMax=1 -i gerana.pem  ubuntu@testing.invucorp.com`
    exec(cmd, (error, stdout, stderr) => {
        console.error(stderr);
        setTimeout(runSSH, 3000)
    });
}
