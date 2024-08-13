const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser());

// GET request
router.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = 'Hello, world!';
});

// POST request
router.post('/data', async (ctx) => {
  const data = ctx.request.body;
  if (!data) {
    ctx.status = 400;
    ctx.body = 'Bad Request: No data provided';
  } else {
    ctx.status = 201;
    ctx.body = `Data received: ${JSON.stringify(data)}`;
  }
});

// DELETE request
router.delete('/data/:id', async (ctx) => {
  const id = ctx.params.id;
  if (!id) {
    ctx.status = 400;
    ctx.body = 'Bad Request: No ID provided';
  } else {
    ctx.status = 204;
  }
});

// OPTIONS request
router.options('/data', async (ctx) => {
  ctx.set('Allow', 'GET,POST,DELETE,OPTIONS');
  ctx.status = 200;
  ctx.body = 'Allowed methods: GET, POST, DELETE, OPTIONS';
});

// 3XX Redirection example
router.get('/redirect', async (ctx) => {
  ctx.status = 301;
  ctx.redirect('/');
});

// 4XX Client Error example
router.get('/client-error', async (ctx) => {
  ctx.status = 404;
  ctx.body = 'Not Found';
});

// 5XX Server Error example
router.get('/server-error', async (ctx) => {
  ctx.status = 500;
  ctx.body = 'Internal Server Error';
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
