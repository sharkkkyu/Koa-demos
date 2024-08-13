const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('get方法成功了');
});

app.post('/data', (req, res) => {
  const data = req.body;
  if (!data) {
    res.status(400).send('POST:data不存在');
  } else {
    res.status(201).send(`POST收到: ${JSON.stringify(data)}`);
  }
});

app.delete('/data/:id', (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).send('DELETE:id未提供');
  } else {
    res.status(204).send('删除成功');
  }
});

app.options('/data', (req, res) => {
  res.set('Allow', 'GET,POST,DELETE,OPTIONS');
  res.status(200).send('OPTIONS允许请求: GET, POST, DELETE, OPTIONS');
});

app.get('/redirect', (req, res) => {
  res.redirect(301, '/');
});

app.get('/client-error', (req, res) => {
  res.status(404).send('Not Found');
});

app.get('/server-error', (req, res) => {
  res.status(500).send('服务器错误');
});

app.listen(port, () => {
  console.log(`运行在 http://localhost:${port}/`);
});
