/*
 * Android Mirror - v0.1
 * 
 * vqtrong@humaxdigital.com
*/

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  console.log(err.stack);
});

const express = require('express');
const execSync = require('child_process').execSync;
const mirrorTcpStream = require('./lib/mirror-tcp-stream');

const app = express();
const wss = require('express-ws')(app);

app.use(express.static(__dirname + '/public'));

app.use(function (err, req, res, next) {
  console.error(err);
  next(err);
})

app.ws('/mobile', (ws, req) => {
    console.log('Client connected');

    ws.send(JSON.stringify({
      action: 'init',
      width: '720',
      height: '1280'
    }));

    var videoStream = mirrorTcpStream({ feed_ip : '127.0.0.1', feed_port : 8091 });

    videoStream.on('data', (data) => {
        ws.send(data, { binary: true }, (error) => { if (error) console.error(error); });
    });

    ws.on('close', () => {
        console.log('Client left');
        videoStream.removeAllListeners('data');
    });

    ws.on('message', (msg) => {
      console.log(msg)
      execSync('..\\scrcpy\\adb shell input ' + msg, { encoding: 'utf-8' });
    });
});

app.listen(8090, () => console.log('Server started on 8090'));
