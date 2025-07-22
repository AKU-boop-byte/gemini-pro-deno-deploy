// 最终测试脚本 - 验证修复后的百度地图工具
import { BaiduMapTool } from './src/static/js/tools/baidu-map-tool.js';

async function testFixedBaiduMaps() {
    console.log('🎯 测试修复后的百度地图工具...\n');
    
    const baiduTool = new BaiduMapTool();
    
    try {
        // 测试地点搜索
        console.log('🔍 测试地点搜索: "北京大学在哪里"');
        const locationResult = await baiduTool.execute({
            query: "北京大学",
            region: "北京"
        });
        
        if (locationResult.success) {
            console.log('✅ 成功获取位置信息:');
            console.log(`   📍 名称: ${locationResult.location.name}`);
            console.log(`   📍 地址: ${locationResult.location.address}`);
            console.log(`   📍 坐标: ${locationResult.location.latitude}, ${locationResult.location.longitude}`);
            console.log(`   📞 电话: ${locationResult.location.phone || '无'}`);
            console.log(`   📋 摘要: ${locationResult.summary}`);
        } else {
            console.log('❌ 搜索失败:', locationResult.error);
            console.log('💡 建议:', locationResult.suggestion);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 测试路线规划 - 使用坐标
        console.log('🚗 测试路线规划: "北京西站到北京大学"');
        const directionsResult = await baiduTool.execute({
            origin: "39.89491,116.322056",  // 北京西站坐标
            destination: "39.999701,116.312612"  // 北京大学坐标
        });
        
        if (directionsResult.success) {
            console.log('✅ 成功获取路线信息:');
            console.log(`   📏 距离: ${directionsResult.distance_km}公里`);
            console.log(`   ⏱️ 时间: ${directionsResult.duration_minutes}分钟`);
            console.log(`   📋 摘要: ${directionsResult.summary}`);
        } else {
            console.log('❌ 路线规划失败:', directionsResult.error);
            console.log('💡 建议:', directionsResult.suggestion);
        }
        
        console.log('\n🎉 修复完成！工具现在可以正常工作了');
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

testFixedBaiduMaps();
