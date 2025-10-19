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

## 前端架构

### CSS 设计系统（层级式）
1. `tokens.css` - 设计变量（颜色、字体、间距、阴影、z-index）
2. `base.css` - 基础重置和全局样式
3. `components.css` - 可复用组件（按钮、表单、模态框、Toast）
4. `responsive-optimized.css` - 响应式断点和移动端优化
5. `app.css` - 应用特定样式（导入以上所有文件）

### 移动端交互
- **查看/编辑模式切换**：通过 `toggleViewMode(viewMode)` 函数（app.js:167）
  - 查看模式：显示顶部栏，隐藏底部工具栏，纯文本模式下 textarea 设置 `readonly`
  - 编辑模式：显示底部工具栏，textarea 可编辑
- **状态管理**：通过 body class（`mobile-view-mode` / `mobile-edit-mode`）

### Alpine.js 组件
- **Modal Component** (components/modal.js) - 密码输入、确认对话框
- **Toast Component** (components/toast.js) - 消息提示系统
- 使用 `window.showPasswordPrompt()`、`window.showSuccess()`、`window.showError()` 调用

## 应用密码保护（可选功能）

### 设置方法
通过 GitHub Secrets 设置 `SCN_APP_PASSWORD`，部署时会自动生成 hash 并注入到 Worker。

### 工作原理
- 访问根路径 `/` 或不存在的笔记时，需要验证应用密码
- 认证通过后设置 `app_auth` cookie（有效期 7 天）
- 使用独立的 JWT token，payload 为 `{ app: true }`

### 相关代码
- `src/index.js:16-25` - 根路径检查
- `src/index.js:62-71` - 笔记路径检查
- `src/index.js:98-121` - `/auth/app` 认证端点
- `src/helper.js:83-94` - `checkAppAuth()` 函数

## 重要交互细节

### 移动端纯文本模式
- 查看模式下 textarea 必须设置 `readonly = true`（app.js:196）
- 编辑模式下 textarea 必须设置 `readonly = false`（app.js:209）
- CSS 通过 `body.mobile-view-mode #contents[readonly]` 提供视觉反馈

### 模态框交互
- 所有模态框应支持遮罩点击关闭（与二维码模态框保持一致）
- 分享模态框复制按钮使用 toast 反馈，而非内联样式

## 开发调试

### 本地开发静态资源
- 开发环境：访问路径为 `/static/css/app.css`
- 生产环境：访问路径为 `/css/app.css`（通过 CDN）
- `src/constant.js` 中 `NODE_ENV` 控制 `CDN_PREFIX`

### KV 数据结构
**NOTES KV:**
```javascript
key: 笔记路径（如 "example"）
value: 笔记内容（文本）
metadata: {
  pw: "hash",          // 密码 hash（可选）
  mode: "md|plain",    // 模式（可选）
  share: true|false,   // 是否分享（可选）
  updateAt: 1234567890 // Unix 时间戳
}
```

**SHARE KV:**
```javascript
key: MD5(笔记路径)
value: 笔记路径
```

## 注意事项

- wrangler.toml 中的 KV binding IDs 会被 GitHub Actions 自动管理
- Cloudflare 免费版每天有 1000 次 KV 写入限制
- 生产环境的 SALT 和 SECRET 必须通过 GitHub Secrets 设置，不要硬编码
