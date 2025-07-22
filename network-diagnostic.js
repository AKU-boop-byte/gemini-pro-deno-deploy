// 网络连接和API诊断脚本
import { BaiduMapTool } from './src/static/js/tools/baidu-map-tool.js';

async function diagnoseNetworkIssue() {
    console.log('🔍 开始网络连接和API诊断...\n');
    
    const baiduTool = new BaiduMapTool();
    
    try {
        console.log('1. 测试百度地图API连接...');
        
        // 直接测试API连接
        const apiKey = 'K0RhNE8R4HEF00DNhat61mmqaIlROWAL';
        const testUrl = `https://api.map.baidu.com/place/v2/search?query=北京大学&region=北京&output=json&ak=${apiKey}`;
        
        console.log('→ 测试URL:', testUrl);
        
        const response = await fetch(testUrl);
        console.log('→ HTTP状态:', response.status);
        console.log('→ HTTP状态文本:', response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('→ API响应状态:', data.status);
            console.log('→ API消息:', data.message);
            
            if (data.status === 0) {
                console.log('✅ API连接正常');
                if (data.results && data.results.length > 0) {
                    console.log('✅ 找到结果:', data.results.length, '个');
                    console.log('✅ 第一个结果:', data.results[0].name);
                }
            } else {
                console.log('❌ API错误:', data.message);
            }
        } else {
            console.log('❌ HTTP错误:', response.status, response.statusText);
        }
        
        console.log('\n2. 测试工具调用...');
        const result = await baiduTool.execute({
            query: "北京大学",
            region: "北京"
        });
        
        if (result.success) {
            console.log('✅ 工具调用成功');
            console.log('📍 位置:', result.location.name);
            console.log('📍 地址:', result.location.address);
        } else {
            console.log('❌ 工具调用失败:', result.error);
            console.log('💡 建议:', result.suggestion);
        }
        
    } catch (error) {
        console.error('❌ 网络错误:', error.message);
        console.log('💡 可能原因:');
        console.log('   1. 网络连接问题');
        console.log('   2. 防火墙阻止');
        console.log('   3. DNS解析问题');
        console.log('   4. 百度地图API限制');
    }
    
    console.log('\n3. 网络连接测试...');
    try {
        const test = await fetch('https://www.baidu.com');
        console.log('✅ 网络连接正常');
    } catch (e) {
        console.log('❌ 网络连接异常:', e.message);
    }
}

diagnoseNetworkIssue();
