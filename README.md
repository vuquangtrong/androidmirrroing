# Android Mirrroing
I have been searching for a way to stream android screen to a web. Finally I've found some amazing tools then I decided to combine them together.

[**scrcpy**](https://github.com/Genymobile/scrcpy) is a wonderful tool for streamming in recent days, so I would love to use it as a recorder which captures screen and then outputs a h264 video stream. I connect my android phone to the PC. **ADB** is used to put the `scrcpy server jar` to you phone and run it. Next step is to forward scrcpy server to a local port. Please check `scrcpy.bat`.

[**h264-live-player**](https://github.com/131/h264-live-player) is a good base to build a live h264 player.
I can use sample servers to run a web-server which serves h264 video by reading stream from a tcp and then decoding it on web.
`Node.js` is used to run the server.

# Mirroring Server 
This part is a bridge for `scrcpy` and `h264-live-player`.
I can use the `server-tcp.js` in package `h264-live-player` but there is big problem: only the first client can see the screen!
Therefore, I have to make my own server: read from tcp, handle multi clients, and forward stream to clients.
Install required packages with `npm install` in `mirroring` folder first.

**Run**

run `scrcpy` first, then run `mirror`

