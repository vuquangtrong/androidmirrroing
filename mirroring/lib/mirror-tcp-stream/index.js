const net = require('net');
const Splitter = require('stream-split');
const stream = require('stream');
const StreamConcat = require('stream-concat');

const NALseparator = new Buffer([0,0,0,1]);

const headerData = {
    _waitingStream: new stream.PassThrough(),
    _firstFrames: [],
    _lastIdrFrame: null,

    set idrFrame(frame) {
        this._lastIdrFrame = frame;

        if (this._waitingStream) {
            const waitingStream = this._waitingStream;
            this._waitingStream = null;
            this.getStream().pipe(waitingStream);
        }
    },

    addParameterFrame: function (frame) {
        this._firstFrames.push(frame)
    },

    getStream: function () {
        if (this._waitingStream) {
            return this._waitingStream;
        } else {
            const headersStream = new stream.PassThrough();
            this._firstFrames.forEach((frame) => headersStream.push(frame));
            headersStream.push(this._lastIdrFrame);
            headersStream.end();
            return headersStream;
        }
    }
};

// This returns the live stream only, without the parameter chunks
function getLiveStream(options) {
	console.log("" + options.feed_ip + ":" + options.feed_port)
    return net.connect(options.feed_port, options.feed_ip, function(){
      console.log("remote stream ready");})
    .pipe(new Splitter(NALseparator))
    .pipe(new stream.Transform({ transform: function (chunk, encoding, callback) {
        const chunkWithSeparator = Buffer.concat([NALseparator, chunk]);

        const chunkType = chunk[0] & 0b11111;

        // Capture the first SPS & PPS frames, so we can send stream parameters on connect.
        if (chunkType === 7 || chunkType === 8) {
            headerData.addParameterFrame(chunkWithSeparator);
        } else {
            // The live stream only includes the non-parameter chunks
            this.push(chunkWithSeparator);

            // Keep track of the latest IDR chunk, so we can start clients off with a near-current image
            if (chunkType === 5) {
                headerData.idrFrame = chunkWithSeparator;
            }
        }

        callback();
    }}));
}

var liveStream = null;

module.exports = function (options) {
    if (!liveStream) {
        liveStream = getLiveStream(options);
    }

    return new StreamConcat([headerData.getStream(), liveStream]);
}
