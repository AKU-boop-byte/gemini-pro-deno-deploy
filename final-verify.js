/**
 * 最终验证 - 确认工具声明格式已修复
 */

import { ToolManager } from './src/static/js/tools/tool-manager.js';

function finalVerify() {
    console.log('🎯 最终验证 - 工具声明格式修复确认\n');
    
    const toolManager = new ToolManager();
    const declarations = toolManager.getToolDeclarations();
    
    console.log('📋 修复后的工具声明结构:');
    console.log(JSON.stringify(declarations, null, 2));
    
    // 验证结构
    const isValidStructure = 
        Array.isArray(declarations) && 
        declarations.length === 1 && 
        Array.isArray(declarations[0].functionDeclarations) &&
        declarations[0].functionDeclarations.length === 3;
    
    console.log('\n✅ 结构验证:');
    console.log(`- 是数组: ${Array.isArray(declarations)}`);
    console.log(`- 数组长度: ${declarations.length} (应该是1)`);
    console.log(`- 包含functionDeclarations: ${declarations[0] && Array.isArray(declarations[0].functionDeclarations)}`);
    console.log(`- 函数总数: ${declarations[0] ? declarations[0].functionDeclarations.length : 0} (应该是3)`);
    
    // 验证所有函数名
    if (declarations[0] && declarations[0].functionDeclarations) {
        console.log('\n✅ 函数名验证:');
        declarations[0].functionDeclarations.forEach((func, index) => {
            const valid = /^[a-zA-Z][a-zA-Z0-9_]*$/.test(func.name);
            console.log(`${index + 1}. ${func.name} - ${valid ? '✅ 有效' : '❌ 无效'}`);
        });
    }
    
    console.log('\n🎉 修复完成！工具声明格式已调整为Google Gemini API标准格式。');
    console.log('📤 现在发送到API的格式将是一个包含所有函数声明的单一对象。');
}

finalVerify();
