// 极简版 node.js（仅验证启动，无复杂依赖）
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

// 放弃引入 app.js/config.js，避免依赖缺失报错
const app = new Hono();
app.get('/', (c) => c.text('Test Success!'));

const port = Number(process.env.PORT) || 8080;
const hostname = '0.0.0.0';

serve({
  fetch: app.fetch,
  port: port,
  hostname: hostname
}, () => {
  console.log(`✅ 服务启动成功：http://${hostname}:${port}`);
});
