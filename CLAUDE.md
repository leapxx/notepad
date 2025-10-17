# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Serverless Cloud Notepad - 基于 Cloudflare Workers 和 KV 的无服务器云笔记应用。支持密码保护、Markdown 模式和分享功能。

## 常用命令

### 开发
```bash
npm run start           # 启动本地开发服务器（使用 wrangler dev）
```

### 部署
```bash
npm run publish         # 部署到 Cloudflare Workers
```

### GitHub Actions 部署
- 在 Actions 页面手动触发 `Deploy cloud-notepad` 工作流
- 需要设置三个 Secrets：`CLOUDFLARE_API_TOKEN`、`SCN_SALT`、`SCN_SECRET`
- 工作流会自动创建 KV 命名空间（如果需要）并更新 wrangler.toml

## 架构说明

### 核心文件结构
- `src/index.js` - 主路由处理器，使用 itty-router 定义所有 API 路由
- `src/helper.js` - 工具函数（JWT 验证、密码加盐、KV 查询等）
- `src/template.js` - HTML 模板生成（Edit、Share、NeedPasswd、Page404 页面）
- `src/constant.js` - 常量定义（CDN 路径、语言配置、密钥）

### 数据存储
使用两个 Cloudflare KV 命名空间：
- `NOTES` - 存储笔记内容和元数据（密码、模式、分享状态、更新时间）
- `SHARE` - 存储分享链接的 MD5 到路径的映射

### 路由架构
1. **静态资源** (`/css/*`, `/js/*`, `/img/*`) - 本地开发使用 Node.js fs 读取，生产环境通过 CDN 提供
2. **根路径** (`/`) - 重定向到随机 3 字符路径
3. **分享链接** (`/share/:md5`) - 只读模式查看笔记
4. **笔记编辑** (`/:path`) - 查看/编辑指定路径的笔记，支持密码保护
5. **API 端点**:
   - `POST /:path` - 保存笔记内容
   - `POST /:path/auth` - 密码验证
   - `POST /:path/pw` - 设置/修改密码
   - `POST /:path/setting` - 更新设置（模式、分享）

### 认证机制
- 使用 JWT token 存储在 httpOnly cookie 中
- 密码通过双重 MD5 加盐存储
- Token 有效期 7 天，路径级别隔离

### 国际化
- 通过 Accept-Language 请求头自动检测语言
- 支持英文 (en) 和中文 (zh)
- 在 `SUPPORTED_LANG` 中定义所有 UI 文本

### 环境配置
开发环境修改 `src/constant.js`：
- `NODE_ENV` - 控制静态资源路径（开发用 `/static`，生产用 CDN）
- `SCN_SALT` / `SCN_SECRET` - 本地测试用，生产环境通过 wrangler secrets 注入

## 注意事项

- wrangler.toml 中的 KV binding IDs 会被 GitHub Actions 自动管理
- Cloudflare 免费版每天有 1000 次 KV 写入限制
- 生产环境的 SALT 和 SECRET 必须通过 GitHub Secrets 设置，不要硬编码
