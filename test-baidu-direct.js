// 直接测试百度地图工具，不依赖MCP
import { BaiduMapTool } from './src/static/js/tools/baidu-map-tool.js';

async function testBaiduMaps() {
  console.log("Testing Baidu Maps tool directly...");
  
  const baiduMapTool = new BaiduMapTool();
  
  try {
    // Test get_location_info
    console.log("\n🔍 Testing get_location_info...");
    const locationResult = await baiduMapTool.execute({
      query: "北京大学",
      region: "北京"
    });
    console.log("📍 北京大学位置信息:");
    if (locationResult.results && locationResult.results.length > 0) {
      const firstResult = locationResult.results[0];
      console.log(`名称: ${firstResult.name}`);
      console.log(`地址: ${firstResult.address}`);
      console.log(`坐标: ${firstResult.location.lat}, ${firstResult.location.lng}`);
      console.log(`电话: ${firstResult.telephone || '无'}`);
    }

    // Test get_driving_directions with coordinates
    console.log("\n🚗 Testing get_driving_directions...");
    const directionsResult = await baiduMapTool.execute({
      origin: "39.89491,116.322056",  // 北京西站坐标
      destination: "39.999701,116.312612"  // 北京大学坐标
    });
    console.log("🗺️ 驾车路线信息:");
    if (directionsResult.result && directionsResult.result.routes && directionsResult.result.routes.length > 0) {
      const route = directionsResult.result.routes[0];
      console.log(`距离: ${route.distance}米 (${(route.distance/1000).toFixed(1)}公里)`);
      console.log(`预计时间: ${Math.round(route.duration/60)}分钟`);
      console.log(`路线步骤: ${route.steps ? route.steps.length : 0}步`);
    }

    console.log("\n✅ 所有测试完成！百度地图工具正常工作");

  } catch (error) {
    console.error("❌ 错误:", error);
  }
}

testBaiduMaps();
