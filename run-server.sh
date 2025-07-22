#!/bin/bash
# Deno服务器启动脚本（Windows版本）

# 使用正确的Deno权限启动服务器
./deno.exe run --allow-net --allow-read --allow-env src/deno_server.ts
