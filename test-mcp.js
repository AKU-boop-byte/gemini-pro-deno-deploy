#!/usr/bin/env -S deno run --allow-net --allow-env

import { Client } from "npm:@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "npm:@modelcontextprotocol/sdk/client/stdio.js";

async function testBaiduMapsMCP() {
  console.log("Testing Baidu Maps MCP server...");
  
  const transport = new StdioClientTransport({
    command: "deno",
    args: ["run", "--allow-net", "--allow-env", "./mcp-servers/baidu-maps-server-deno.js"],
  });

  const client = new Client({
    name: "test-client",
    version: "1.0.0",
  });

  try {
    await client.connect(transport);
    console.log("✅ Connected to MCP server");

    // List available tools
    const tools = await client.listTools();
    console.log("📋 Available tools:", tools.tools.map(t => t.name));

    // Test get_location_info
    console.log("\n🔍 Testing get_location_info...");
    const locationResult = await client.callTool({
      name: "get_location_info",
      arguments: {
        query: "北京大学",
        region: "北京"
      }
    });
    console.log("📍 Location result:", locationResult.content[0].text);

    // Test get_driving_directions
    console.log("\n🚗 Testing get_driving_directions...");
    const directionsResult = await client.callTool({
      name: "get_driving_directions",
      arguments: {
        origin: "北京西站",
        destination: "北京大学"
      }
    });
    console.log("🗺️ Directions result:", directionsResult.content[0].text);

    await transport.close();
    console.log("\n✅ All tests completed successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
    await transport.close();
  }
}

testBaiduMapsMCP();
