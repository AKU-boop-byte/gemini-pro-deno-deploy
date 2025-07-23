import { serveDir } from "std/http/file_server.ts";

const PORT = 8000;

console.log(`Deno server starting on http://localhost:${PORT}`);

// 处理WebSocket连接 - 模拟响应
function handleWebSocket(request: Request): Response {
  if (request.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket: client, response } = Deno.upgradeWebSocket(request);
  
  client.onopen = () => {
    console.log("Client WebSocket connected");
    // 模拟连接成功后，服务器发送 setupComplete
    const setupCompleteResponse = { setupComplete: { timeout: 600 } };
    client.send(JSON.stringify(setupCompleteResponse));
  };

  client.onmessage = (event) => {
    console.log("Received message:", event.data);
    // 模拟收到消息后，返回一个简单的文本响应
    const textResponse = {
      serverContent: {
        modelTurn: {
          parts: [{ text: "这是来自Deno服务器的模拟响应。" }]
        },
        turnComplete: true
      }
    };
    client.send(JSON.stringify(textResponse));
  };

  client.onclose = () => {
    console.log("Client WebSocket disconnected");
  };

  client.onerror = (error) => {
    console.error("Client WebSocket error:", error);
  };

  return response;
}

// 处理API请求
async function handleAPIRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // 模拟API响应
  if (url.pathname.includes("/chat/completions")) {
    return new Response(JSON.stringify({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: Date.now(),
      model: "gemini-2.5-pro",
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: "这是来自本地Deno服务器的模拟响应"
        },
        finish_reason: "stop"
      }]
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (url.pathname.includes("/models")) {
    return new Response(JSON.stringify({
      object: "list",
      data: [
        {
          id: "gemini-2.5-pro",
          object: "model",
          created: Date.now(),
          owned_by: "google"
        }
      ]
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response("API endpoint not found", { status: 404 });
}

// 主请求处理器
async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  console.log(`${request.method} ${url.pathname}`);

  // 处理WebSocket连接
  if (url.pathname.startsWith("/ws")) {
    return handleWebSocket(request);
  }

  // 处理API请求
  if (url.pathname.startsWith("/v1/")) {
    return handleAPIRequest(request);
  }

  // 统一处理所有静态文件请求
  return serveDir(request, {
    fsRoot: "./src/static", // 静态文件根目录
    urlRoot: "",           // URL根路径
    showDirListing: true,  // 如果找不到index.html，可以选择显示目录
    quiet: true,
  });
}

// 启动服务器
Deno.serve(handler, { port: PORT });

console.log(`🚀 Server running at:`);
console.log(`   Local: http://localhost:${PORT}`);
console.log(`   Network: http://localhost:${PORT}`);
console.log(`\n📁 Serving files from: ./src/static`);
console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws`);
console.log(`🔧 API endpoints:`);
console.log(`   - GET  http://localhost:${PORT}/v1/models`);
console.log(`   - POST http://localhost:${PORT}/v1/chat/completions`);
