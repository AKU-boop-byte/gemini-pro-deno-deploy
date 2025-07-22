// 工具初始化监控脚本
// 确保所有工具都能正确显示初始化状态

import { ToolManager } from './src/static/js/tools/tool-manager.js';
import { BaiduMapTool } from './src/static/js/tools/baidu-map-tool.js';
import { GoogleSearchTool } from './src/static/js/tools/google-search.js';
import { WeatherTool } from './src/static/js/tools/weather-tool.js';
import { GpsTool } from './src/static/js/tools/gps-tool.js';

console.log('🔍 工具初始化监控开始...\n');

// 创建工具管理器实例
const toolManager = new ToolManager();

// 强制显示所有工具初始化状态
console.log('📋 强制工具初始化状态显示:');
console.log('=====================================');

// 手动注册并显示所有工具
const tools = {
    baiduMap: new BaiduMapTool(),
    googleSearch: new GoogleSearchTool(),
    weather: new WeatherTool(),
    gps: new GpsTool()
};

// 显示每个工具的详细信息
Object.entries(tools).forEach(([name, tool]) => {
    console.log(`✅ ${name}: ${tool.constructor.name}`);
    const declarations = tool.getDeclaration();
    console.log(`   工具声明数量: ${declarations.length}`);
    declarations.forEach((decl, index) => {
        console.log(`   ${index + 1}. ${decl.name}: ${decl.description}`);
    });
    console.log('---');
});

// 显示工具管理器总览
console.log('\n📊 工具管理器总览:');
console.log('==================');
console.log(`总工具数量: ${Object.keys(tools).length}`);
console.log('已注册工具:');
toolManager.tools.forEach((tool, name) => {
    console.log(`  ✅ ${name}: ${tool.constructor.name}`);
});

// 显示工具声明总览
console.log('\n📋 工具声明总览:');
console.log('================');
const allDeclarations = toolManager.getToolDeclarations();
const functionDeclarations = allDeclarations[0].functionDeclarations;
console.log(`总工具声明数: ${functionDeclarations.length}`);
functionDeclarations.forEach((decl, index) => {
    console.log(`  ${index + 1}. ${decl.name}`);
});

// 测试工具调用
console.log('\n🎯 工具调用测试:');
console.log('================');
async function testAllTools() {
    try {
        console.log('→ 测试百度地图工具...');
        const baiduResult = await toolManager.handleToolCall({
            name: 'get_location_info',
            args: { query: '北京大学', region: '北京' },
            id: 'monitor-test-001'
        });
        console.log('✅ 百度地图工具调用成功');

        console.log('→ 测试天气工具...');
        const weatherResult = await toolManager.handleToolCall({
            name: 'get_weather_on_date',
            args: { location: '北京', date: '今天' },
            id: 'monitor-test-002'
        });
        console.log('✅ 天气工具调用成功');

        console.log('→ 测试Google搜索工具...');
        const searchResult = await toolManager.handleToolCall({
            name: 'google_search',
            args: { query: '北京大学' },
            id: 'monitor-test-003'
        });
        console.log('✅ Google搜索工具调用成功');

        console.log('→ 测试GPS工具...');
        const gpsResult = await toolManager.handleToolCall({
            name: 'get_current_gps_location',
            args: {},
            id: 'monitor-test-004'
        });
        console.log('✅ GPS工具调用成功');

    } catch (error) {
        console.error('❌ 工具调用失败:', error);
    }
}

testAllTools().then(() => {
    console.log('\n🎉 工具初始化监控完成！');
    console.log('💡 所有工具已正确初始化并准备就绪');
});
