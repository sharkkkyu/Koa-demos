const MyWebSocket = require('./server');
const ws = new MyWebSocket({port : 8080});
ws.on('data',(data) => {
    console.log('收到了你的消息：' + data);
});
ws.on('close',(code,reason) => {
    console.log('close:',code,reason);
});