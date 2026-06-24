# AI 班主任评语助手

基于 React、TypeScript、Tailwind CSS 的可运行 Web 第一版。学生数据、评语历史和 PDF 模板自动保存在浏览器 `localStorage`。

## 启动

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

演示激活码：`PY-DEMO-2026-LOCAL`。管理员入口为 `/#/admin`，本地演示密码为 `admin`。

## 已实现

- 主界面学生增删改查、筛选、标签、规则生成、锁定和批量操作
- Excel/CSV 名单导入、Excel 与 Word 导出、项目 JSON 备份恢复
- AI 增强三栏视图、语气与字数设置、历史版本恢复
- A4 标签排版、2/4/6/8/10/12 分规格、背景、元素拖拽和打印
- 本地演示激活码及管理员激活码生成页

## 生产部署说明

预览服务已经提供同源服务端接口：`POST /api/comment/ai-polish` 与 `POST /api/comment/ai-rewrite`。复制 `.env.example` 为 `.env`，填写 `AI_API_BASE_URL`、`AI_API_KEY` 和 `AI_MODEL`，然后重启 `npm run preview` 即可调用真实的 OpenAI-Compatible 模型。访问 `/api/health` 可检查 `aiConfigured` 是否为 `true`。

未配置 `AI_API_KEY` 时，前端自动使用本地演示转换，方便测试界面。密钥只由 `preview-server.mjs` 读取，不会进入浏览器构建产物。正式生产环境仍应把激活码、设备绑定、次数扣减和使用日志迁移到数据库。

浏览器打印页中选择“另存为 PDF”即可导出 PDF。导入名单推荐先下载页面提供的 Excel 模板。
