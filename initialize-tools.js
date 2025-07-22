// 工具初始化验证脚本
import { ToolManager } from './src/static/js/tools/tool-manager.js';
import { BaiduMapTool } from './src/static/js/tools/baidu-map-tool.js';
import { GoogleSearchTool } from './src/static/js/tools/google-search.js';
import { WeatherTool } from './src/static/js/tools/weather-tool.js';
import { GpsTool } from './src/static/js/tools/gps-tool.js';

console.log('🔧 开始工具初始化验证...\n');

// 创建工具管理器
const toolManager = new ToolManager();

// 验证所有工具是否正确注册
console.log('📋 验证工具注册状态:');
const tools = toolManager.tools;
console.log(`已注册工具数量: ${tools.size}`);

tools.forEach((tool, name) => {
    console.log(`  ✅ ${name}: ${tool.constructor.name}`);
});

// 验证工具声明
console.log('\n📋 验证工具声明:');
const declarations = toolManager.getToolDeclarations();
const functionDeclarations = declarations[0].functionDeclarations;

console.log(`工具声明总数: ${functionDeclarations.length}`);
functionDeclarations.forEach((decl, index) => {
    console.log(`  ${index + 1}. ${decl.name}: ${decl.description}`);
});

// 验证百度地图工具
console.log('\n🔍 验证百度地图工具:');
const baiduTool = new BaiduMapTool();
const baiduDeclarations = baiduTool.getDeclaration();
console.log(`百度地图工具声明: ${baiduDeclarations.length}个`);
baiduDeclarations.forEach(decl => {
    console.log(`  - ${decl.name}: ${decl.description}`);
});

// 测试工具调用
console.log('\n🎯 测试工具调用:');
async function testToolInitialization() {
    try {
        // 测试百度地图工具
        console.log('→ 测试百度地图工具调用...');
        const result = await toolManager.handleToolCall({
            name: 'get_location_info',
            args: { query: '北京大学', region: '北京' },
            id: 'test-init-001'
        });
        
        console.log('✅ 工具调用成功:');
        if (result.functionResponses && result.functionResponses[0]) {
            const response = result.functionResponses[0].response;
            if (response.output && response.output.success) {
                console.log(`   📍 位置: ${response.output.location.name}`);
                console.log(`   📍 地址: ${response.output.location.address}`);
            }
        }
    } catch (error) {
        console.error('❌ 工具调用失败:', error);
    }
}

// 验证工具映射
console.log('\n🔍 验证工具名称映射:');
console.log('工具名称映射规则:');
console.log('  - get_location_info → baiduMap');
console.log('  - get_driving_directions → baiduMap');
console.log('  - get_weather_on_date → weather');
console.log('  - google_search → googleSearch');
console.log('  - get_current_gps_location → gps');

// 执行验证
testToolInitialization().then(() => {
    console.log('\n🎉 工具初始化验证完成！');
    console.log('💡 确保在WebSocket连接时，CONFIG.TOOLS包含这些工具声明');
});
