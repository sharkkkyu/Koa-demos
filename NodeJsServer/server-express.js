const express = require('express');
const app = express();
const port = 3000;
app.get('/',(req,res) => {
    res.send('发送了一个data:ysm'); // 向客户端发送数据
});
app.get('/ysm2',(req,res) => {
    res.send('发送了一个data:ysm2'); // 向客户端发送数据
});
app.listen(port,() => {
    console.log(`运行在: http://localhost:${port}/`)
})