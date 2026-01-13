import { serve } from '@hono/node-server'
import app from './app.js'
import config from './src/config.js'

// 核心修改1：优先使用 EdgeOne 分配的环境变量 PORT，兜底用配置文件的端口
const port = process.env.PORT || config.PORT;

// 启动服务并添加启动日志
const server = serve({
    fetch: app.fetch,
    port: port // 使用适配后的端口
}, (info) => {
    // 核心修改2：输出明确的启动日志，让 EdgeOne 识别服务就绪
    console.log(`✅ Meting 服务启动成功`);
    console.log(`✅ 监听端口：${info.port}`);
    console.log(`✅ 访问地址：http://0.0.0.0:${info.port}`);
});

// 可选：添加进程退出处理，增强服务稳定性（防止意外退出）
process.on('SIGTERM', () => {
    console.log('🔴 收到退出信号，正在关闭服务...');
    server.close(() => {
        console.log('🔴 服务已优雅关闭');
        process.exit(0);
    });
});

// 可选：捕获未处理的错误，避免服务静默崩溃
process.on('uncaughtException', (err) => {
    console.error('❌ 未捕获的异常：', err);
    process.exit(1);
});
