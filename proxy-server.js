// 代理服务器 - 解决CORS问题
// 这个服务器将代理百度地图API请求，避免浏览器CORS限制

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const API_KEY = 'K0RhNE8R4HEF00DNhat61mmqaIlROWAL';

// 处理代理请求
async function handleProxyRequest(request) {
    const url = new URL(request.url);
    
    // 处理百度地图API代理
    if (url.pathname.startsWith('/api/baidu/')) {
        const endpoint = url.pathname.replace('/api/baidu/', '');
        const searchParams = new URLSearchParams(url.search);
        searchParams.set('ak', API_KEY);
        
        const baiduUrl = `https://api.map.baidu.com/${endpoint}?${searchParams.toString()}`;
        
        try {
            const response = await fetch(baiduUrl, {
                method: request.method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            return new Response(JSON.stringify(data), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
            
        } catch (error) {
            return new Response(JSON.stringify({
                status: 500,
                message: '代理服务器错误: ' + error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }
    
    // 处理OPTIONS请求（CORS预检）
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }
    
    // 返回404
    return new Response('Not Found', { status: 404 });
}

// 启动代理服务器
console.log('🚀 启动百度地图API代理服务器...');
console.log('📍 代理地址: http://localhost:3001');
console.log('📍 使用方式: http://localhost:3001/api/baidu/place/v2/search?query=北京大学&region=北京');

serve(handleProxyRequest, { port: 3001 });
