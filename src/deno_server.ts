import { serveDir } from "std/http/file_server.ts";

const PORT = 8000;

console.log(`Deno server starting on http://localhost:${PORT}`);

// 处理WebSocket连接 - 直接代理到Google Gemini API
function handleWebSocket(request: Request): Response {
  if (request.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const url = new URL(request.url);
  const apiKey = url.searchParams.get("key") || "";
  
  if (!apiKey) {
    return new Response("API key is required", { status: 400 });
  }

  // 从客户端请求中提取 Sec-WebSocket-Protocol
  const protocol = request.headers.get("sec-websocket-protocol");
  const { socket: client, response } = Deno.upgradeWebSocket(request, {
    protocol,
  });
  
  let googleWs: WebSocket | null = null;

  client.onopen = () => {
    console.log("Client WebSocket connected");
  };

  client.onmessage = (event) => {
    // 第一次收到消息时，才连接 Google
    if (!googleWs) {
      const googleUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      
      try {
        // 连接Google时，传递从客户端获取的协议
        const newWs = new WebSocket(googleUrl, protocol ? [protocol] : undefined);
        
        newWs.onopen = () => {
          console.log("Connected to Google Gemini API");
          // 直接转发客户端的第一条消息（包含setup配置）
          newWs.send(event.data);
        };
        
        newWs.onmessage = (e) => {
          // 直接转发Google的响应给客户端
          if (client.readyState === WebSocket.OPEN) {
            client.send(e.data);
          }
        };
        
        newWs.onclose = (e) => {
          console.log("Google WebSocket closed:", e.code, e.reason);
          if (client.readyState === WebSocket.OPEN) {
            client.close(1000, "Google connection closed");
          }
        };
        
        newWs.onerror = (error) => {
          console.error("Google WebSocket error:", error);
          if (client.readyState === WebSocket.OPEN) {
            client.close(1006, "Google API connection failed");
          }
        };

        googleWs = newWs;

      } catch (error) {
        console.error("Failed to connect to Google API:", error);
        client.close(1006, "Failed to connect to Google API");
      }
    } else if (googleWs.readyState === WebSocket.OPEN) {
      // 后续消息直接转发
      googleWs.send(event.data);
    }
  };

  client.onclose = () => {
    console.log("Client WebSocket disconnected");
    if (googleWs && googleWs.readyState === WebSocket.OPEN) {
      googleWs.close();
    }
  };

  client.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    if (googleWs && googleWs.readyState === WebSocket.OPEN) {
      googleWs.close();
    }
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
  // 使用 import.meta.url 来确保静态文件路径的正确性
  const staticFilesRoot = new URL("../static", import.meta.url).pathname;

  return serveDir(request, {
    fsRoot: staticFilesRoot, // 静态文件根目录
    urlRoot: "",             // URL根路径
    showDirListing: true,    // 如果找不到index.html，可以选择显示目录
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
