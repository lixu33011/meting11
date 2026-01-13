// 引入核心依赖
import { serve } from '@hono/node-server';
import app from './app.js';
import config from './src/config.js';

/**
 * 核心适配逻辑：
 * 1. 优先读取 EdgeOne 分配的 PORT 环境变量
 * 2. 未读取到时，终止进程并提示（避免使用固定 3000 端口）
 * 3. 输出详细日志，方便排查问题
 */
// 读取 EdgeOne 环境变量 PORT
const edgeOnePort = process.env.PORT;
// 打印环境变量调试信息（关键排查用）
console.log('=== 环境变量调试信息 ===');
console.log('EdgeOne PORT 环境变量值:', edgeOnePort);
console.log('配置文件 PORT 值:', config.PORT);

// 校验 PORT 环境变量是否存在
if (!edgeOnePort) {
  console.error('❌ 错误：未读取到 EdgeOne 分配的 PORT 环境变量！');
  console.error('💡 解决方案：检查 EdgeOne 环境变量配置，或在构建命令中显式传递 PORT={{ PORT }}');
  process.exit(1); // 强制退出，避免使用无效端口
}

// 转换端口为数字类型（防止环境变量是字符串导致报错）
const port = Number(edgeOnePort);
if (isNaN(port)) {
  console.error('❌ 错误：PORT 环境变量不是有效数字，值为：', edgeOnePort);
  process.exit(1);
}

/**
 * 启动 Hono 服务
 */
const server = serve({
  fetch: app.fetch,
  port: port, // 仅使用 EdgeOne 分配的端口
  hostname: '0.0.0.0' // 关键：监听所有网卡，让 EdgeOne 能访问到服务
}, (info) => {
  // 启动成功日志（EdgeOne 能识别的关键）
  console.log('\n✅ Meting 服务启动成功！');
  console.log(`✅ 监听地址：http://${info.hostname}:${info.port}`);
  console.log(`✅ 服务状态：已就绪，可正常访问`);
});

/**
 * 进程稳定性处理：
 * 1. 捕获退出信号，优雅关闭服务
 * 2. 捕获未处理异常，避免静默崩溃
 * 3. 捕获未处理的 Promise 拒绝
 */
// 处理 EdgeOne 停止/重启信号
process.on('SIGTERM', () => {
  console.log('\n🔴 收到服务停止信号，正在优雅关闭...');
  server.close(() => {
    console.log('🔴 服务已成功关闭');
    process.exit(0);
  });
});

// 处理手动终止信号（如 Ctrl+C）
process.on('SIGINT', () => {
  console.log('\n🔴 收到手动终止信号，正在关闭服务...');
  server.close(() => {
    console.log('🔴 服务已成功关闭');
    process.exit(0);
  });
});

// 捕获未处理的异常
process.on('uncaughtException', (err) => {
  console.error('\n❌ 未捕获的异常：', err.stack);
  server.close(() => process.exit(1));
});

// 捕获未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ 未处理的 Promise 拒绝：', promise);
  console.error('❌ 拒绝原因：', reason);
  server.close(() => process.exit(1));
});
