export const CONFIG = {
    API: {
        KEY: 'AIzaSyDmmq0orZuNuZVOS7YVfIOH2JmYfhoc_p0',
        VERSION: 'v1beta',
        MODEL_NAME: 'models/gemini-live-2.5-flash-preview'  // 全面更新为指定模型
    },
    
    SYSTEM_INSTRUCTION: {
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
    },
    
    GENERATION_CONFIG: {
        responseModalities: ["TEXT", "AUDIO"]
    },
    
    TOOLS: [{
        functionDeclarations: [
            {
                name: "get_location_info",
                description: "Get precise location information including address, coordinates, and contact details from Baidu Maps",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The specific location name to search for (e.g., '北京大学', '天安门广场')"
                        },
                        region: {
                            type: "string",
                            description: "The city or region to search within (e.g., '北京', '上海')"
                        }
                    },
                    required: ["query", "region"]
                }
            },
            {
                name: "get_driving_directions",
                description: "Get detailed driving directions with distance, time, and step-by-step instructions from Baidu Maps",
                parameters: {
                    type: "object",
                    properties: {
                        origin: {
                            type: "string",
                            description: "The starting point name or coordinates (e.g., '北京西站' or '39.89491,116.322056')"
                        },
                        destination: {
                            type: "string",
                            description: "The destination name or coordinates (e.g., '北京大学' or '39.999701,116.312612')"
                        }
                    },
                    required: ["origin", "destination"]
                }
            }
        ]
    }],
    
    AUDIO: {
        SAMPLE_RATE: 16000,
        OUTPUT_SAMPLE_RATE: 24000,
        BUFFER_SIZE: 2048,
        CHANNELS: 1
    }
};

export default CONFIG;
