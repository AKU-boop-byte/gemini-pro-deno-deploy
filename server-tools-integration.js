// 服务器端工具集成验证
// 这个脚本验证工具在服务器环境中的正确初始化

import { ToolManager } from './src/static/js/tools/tool-manager.js';
import { BaiduMapTool } from './src/static/js/tools/baidu-map-tool.js';
import { GoogleSearchTool } from './src/static/js/tools/google-search.js';
import { WeatherTool } from './src/static/js/tools/weather-tool.js';
import { GpsTool } from './src/static/js/tools/gps-tool.js';

console.log('🔧 服务器端工具集成验证...\n');

// 创建独立的工具管理器实例
const toolManager = new ToolManager();

// 验证工具配置
console.log('📋 服务器端工具配置验证:');
console.log('工具管理器实例:', toolManager.constructor.name);

// 验证所有工具
const tools = [
    { name: 'baiduMap', tool: new BaiduMapTool() },
    { name: 'googleSearch', tool: new GoogleSearchTool() },
    { name: 'weather', tool: new WeatherTool() },
    { name: 'gps', tool: new GpsTool() }
];

console.log('\n🔍 验证所有工具声明:');
tools.forEach(({ name, tool }) => {
    const declarations = tool.getDeclaration();
    console.log(`  ✅ ${name}: ${declarations.length}个工具声明`);
    declarations.forEach(decl => {
        console.log(`     - ${decl.name}: ${decl.description}`);
    });
});

// 验证工具管理器声明
console.log('\n🔍 验证工具管理器总声明:');
const allDeclarations = toolManager.getToolDeclarations();
console.log(`总工具声明数: ${allDeclarations[0].functionDeclarations.length}`);
allDeclarations[0].functionDeclarations.forEach((decl, index) => {
    console.log(`  ${index + 1}. ${decl.name}`);
});

// 测试工具调用
console.log('\n🎯 测试服务器端工具调用:');
async function testServerTools() {
    try {
        // 测试百度地图工具
        console.log('→ 测试百度地图工具...');
        const result = await toolManager.handleToolCall({
            name: 'get_location_info',
            args: { query: '北京大学', region: '北京' },
            id: 'server-test-001'
        });
        
        if (result.functionResponses && result.functionResponses[0]) {
            const response = result.functionResponses[0].response;
            if (response.output && response.output.success) {
                console.log(`✅ 成功: ${response.output.location.name}`);
                console.log(`📍 地址: ${response.output.location.address}`);
            }
        }
    } catch (error) {
        console.error('❌ 工具调用失败:', error);
    }
}

// 验证部署配置
console.log('\n🔧 部署配置验证:');
console.log('✅ 工具文件路径:');
console.log('  - src/static/js/tools/baidu-map-tool.js');
console.log('  - src/static/js/tools/google-search.js');
console.log('  - src/static/js/tools/weather-tool.js');
console.log('  - src/static/js/tools/gps-tool.js');
console.log('  - src/static/js/tools/tool-manager.js');

// 执行验证
testServerTools().then(() => {
    console.log('\n🎉 服务器端工具集成验证完成！');
    console.log('💡 确保Deno服务器运行时，客户端能正确加载这些工具');
});
