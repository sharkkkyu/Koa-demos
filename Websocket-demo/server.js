const hashKey = require('./api');
const { EventEmitter } = require('events');
const http = require('http');
function handleMask(maskBytes, data) {
    const payload = Buffer.alloc(data.length);
    for (let i = 0;i < data.length;i++){
        payload[i] = maskBytes[i%4] ^ data[i];
    }
    return payload;
}; // mask解密
function encodeMessage(opcode, payload) {
    let bufferData = Buffer.alloc(payload.length + 2 + 0);
    let byte1 = parseInt('10000000', 2) | opcode;
    let byte2 = payload.length;

    bufferData.writeUInt8(byte1,0);
    bufferData.writeUInt8(byte2,1);

    payload.copy(bufferData, 2);
    return bufferData;
} // 构造websocket数据帧
const OPCODES = {
    CONTINUE: 0,
    TEXT : 1,
    BINARY: 2,
    CLOSE: 8,
    PING: 9,
    PONG: 10,
}; // 数据种类
class MyWebsocket extends EventEmitter {
    constructor(options) {
        super(options);
        const server = http.createServer();
        server.listen(options.port || 8080);
        server.on('upgrade',(req,socket) => {//请求升级到websocket协议时触发事件
            this.socket = socket;
            socket.setKeepAlive(true); //TCP的keep-alive功能，确保链接在空闲时不被关闭
            const resHeaders = [
                'HTTP/1.1 101 Switching Protocols',
                'Upgrade: websocket',
                'Connection: Upgrade',
                'Sec-WebSocket-Accept: ' + hashKey(req.headers['sec-websocket-key']),
                '',
                ''
            ].join('\r\n');//构建请求头
        socket.write(resHeaders);
        socket.on('data',(data) => {
           this.processData(data);
        });
        socket.on('close',(error) => {
            this.emit('close');
        });
        });
    }

    handleRealData(opcode,realDataBuffer) {
        switch(opcode) {
            case OPCODES.TEXT:
                this.emit('data',realDataBuffer.toString('utf8'));// 文本转utf8
                break;
            case OPCODES.BINARY:
                this.emit('data',realDataBuffer);// 二进制直接使用原数据
                break;
            default:
                this.emit('close');
                break;
        }
    }

    processData(bufferData) {
        const byte1 = bufferData.readUInt8(0);
        let opcode = byte1 & 0x0f // 第一个字节后四位 => opcode

        const byte2 = bufferData.readUInt8(1); //第二个字节，第一位是mask，后七位是payload长度
        const str2 = byte2.toString(2);
        const MASK = str2[0];
        let payloadLength = parseInt(str2.substring(1),2);

        let curByteIndex = 2; // 存储处理到第几个字节

        if(payloadLength === 126) {
            payloadLength = bufferData.readUInt16BE(2);
            curByteIndex += 2;
        } else if (payloadLength === 127) {
            payloadLength = bufferData,readBigUInt64BE(2);
            curByteIndex += 8;
        }

        //用mask key 解密数据
        let realData = null;
        if(MASK) {
            const maskKey = bufferData.slice(curByteIndex,curByteIndex + 4);
            curByteIndex += 4;
            const payloadData = bufferData.slice(curByteIndex,curByteIndex + payloadLength);
            realData = handleMask(maskKey,payloadData);
        } else {
            realData = bufferData.slice(curByteIndex,curByteIndex + payloadLength);
        }
        this.handleRealData(opcode,realData);
    } // 处理websocket数据帧，解析传入的bufferData 提取出有效数据并进行处理

    send(data) {
        let opcode;
        let buffer;
        if(Buffer.isBuffer(data)){
            opcode = OPCODES.BINARY;
            buffer = data; 
        } else if (typeof data === 'string') {
            opcode = OPCODES.TEXT;
            buffer = Buffer.from(data,'utf8');
        } else {
            console.error('不支持发送的数据类型');
        }
        this.dosend(opcode,buffer);
    } // 发送数据
    
    dosend(opcode,bufferDatafer){
        this.socket.write(encodeMessage(opcode,bufferDatafer));
    }
}
module.exports = MyWebsocket

