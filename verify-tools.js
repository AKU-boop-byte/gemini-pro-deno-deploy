/**
 * 验证工具函数命名规范
 * 检查所有工具函数名是否以字母开头
 */

import { GoogleSearchTool } from './src/static/js/tools/google-search.js';
import { WeatherTool } from './src/static/js/tools/weather-tool.js';
import { BaiduMapTool } from './src/static/js/tools/baidu-map-tool.js';

function validateFunctionName(name) {
    // 检查是否以字母开头
    const startsWithLetter = /^[a-zA-Z]/.test(name);
    // 检查是否只包含字母、数字和下划线
    const validCharacters = /^[a-zA-Z0-9_]+$/.test(name);
    
    return {
        name,
        startsWithLetter,
        validCharacters,
        isValid: startsWithLetter && validCharacters
    };
}

function validateToolDeclarations() {
    const tools = [
        { name: 'GoogleSearchTool', instance: new GoogleSearchTool() },
        { name: 'WeatherTool', instance: new WeatherTool() },
        { name: 'BaiduMapTool', instance: new BaiduMapTool() }
    ];

    console.log('🔍 验证工具函数命名规范...\n');

    let hasErrors = false;

    tools.forEach(tool => {
        console.log(`📋 ${tool.name}:`);
        const declarations = tool.instance.getDeclaration();
        
        declarations.forEach((declaration, index) => {
            const validation = validateFunctionName(declaration.name);
            
            if (validation.isValid) {
                console.log(`  ✅ ${declaration.name} - 命名规范正确`);
            } else {
                hasErrors = true;
                console.log(`  ❌ ${declaration.name} - 命名规范错误`);
                if (!validation.startsWithLetter) {
                    console.log(`     - 错误：必须以字母开头`);
                }
                if (!validation.validCharacters) {
                    console.log(`     - 错误：只能包含字母、数字和下划线`);
                }
            }
        });
        console.log('');
    });

    if (hasErrors) {
        console.log('❌ 发现命名规范错误，请修复上述问题！');
        process.exit(1);
    } else {
        console.log('✅ 所有工具函数命名规范正确！');
    }
}

// 运行验证
validateToolDeclarations();
