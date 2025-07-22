import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class MCPClient {
  constructor() {
    this.client = new Client({
      name: 'gemini-playground-client',
      version: '1.0.0',
    });
    this.transport = null;
  }

  async connect() {
    this.transport = new StdioClientTransport({
      command: 'node',
      args: ['./mcp-servers/baidu-maps-server.js'],
    });

    await this.client.connect(this.transport);
    console.log('Connected to MCP server');
  }

  async listTools() {
    return await this.client.listTools();
  }

  async callTool(name, args) {
    return await this.client.callTool({ name, arguments: args });
  }

  async disconnect() {
    if (this.transport) {
      await this.transport.close();
    }
  }
}

export default MCPClient;
