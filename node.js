// 最终版 node.js（适配 EdgeOne 容器环境）
import { serve } from '@hono/node-server';
import app from './app.js';
import config from './src/config.js';

// 1. 优先用环境变量，兜底用 8080（EdgeOne 常用端口），放弃 3000
const port = Number(process.env.PORT) || 8080;
// 2. 强制指定监听所有网卡，避免 hostname 问题
const hostname = '0.0.0.0';

// 打印调试日志
console.log('=== 部署调试信息 ===');
console.log('环境变量 PORT:', process.env.PORT);
console.log('最终使用端口:', port);
console.log('监听地址:', `${hostname}:${port}`);

// 3. 启动服务（去掉对 info 对象的依赖）
const server = serve({
  fetch: app.fetch,
  port: port,
  hostname: hostname // 强制指定 0.0.0.0
});

// 4. 手动输出启动完成日志（无需等回调）
setTimeout(() => {
  console.log('✅ Meting 服务启动完成！');
  console.log('✅ 可访问地址：http://0.0.0.0:' + port);
  // 关键：输出 EdgeOne 识别的就绪信号
  console.log('ready'); 
}, 1000);

// 5. 基础的进程处理
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
