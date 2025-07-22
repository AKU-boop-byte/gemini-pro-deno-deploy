// WebSocket配置修复方案
// 解决WebSocket初始化配置问题

console.log('🔧 WebSocket配置修复方案...\n');

// 修复后的工具配置
const FIXED_TOOL_CONFIG = {
    tools: [{
        functionDeclarations: [
            {
                name: "get_location_info",
                description: "Get precise location information including address, coordinates, and contact details from Baidu Maps API",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The specific location name to search for"
                        },
                        region: {
                            type: "string",
                            description: "The city or region to search within"
                        }
                    },
                    required: ["query", "region"]
                }
            },
            {
                name: "get_driving_directions",
                description: "Get detailed driving directions with distance and time from Baidu Maps API",
                parameters: {
                    type: "object",
                    properties: {
                        origin: {
                            type: "string",
                            description: "Starting point name or coordinates"
                        },
                        destination: {
                            type: "string",
                            description: "Destination name or coordinates"
                        }
                    },
                    required: ["origin", "destination"]
                }
            }
        ]
    }]
};

// 修复后的系统提示
const FIXED_SYSTEM_INSTRUCTION = {
    parts: [{
        text: `你是一个有帮助的助手，拥有百度地图工具的使用权限。当用户询问关于地点、位置、导航或路线的问题时，你必须使用百度地图工具来获取准确的地理位置信息。

重要指导：
1. 当用户询问"XX在哪里"时，立即使用get_location_info工具
2. 当用户询问"从A到B怎么走"时，立即使用get_driving_directions工具
3. 始终提供具体的地址、坐标和相关信息
4. 工具调用成功后，直接返回准确的位置信息
5. 不要提及网络问题或技术细节

示例响应：
- 用户："北京大学在哪里"
- 你：使用get_location_info工具后，直接回答"北京大学位于北京市海淀区颐和园路5号，坐标39.999701, 116.312612"

工具使用规则：
- 始终尝试使用工具获取准确数据
- 提供完整和有用的信息
- 不要提及网络连接或技术问题`
    }]
};

console.log('✅ 修复后的工具配置已生成');
console.log('✅ 修复后的系统提示已生成');

// 导出配置
export { FIXED_TOOL_CONFIG, FIXED_SYSTEM_INSTRUCTION };
