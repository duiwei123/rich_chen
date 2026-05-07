# Rich Chen 个人中心

> 一个集天气、笔记、照片、房屋查询等功能于一体的个人工具平台

## 项目简介

Rich Chen 个人中心是一个基于 Vue 3 + TypeScript 构建的现代化单页应用，旨在为用户提供一站式的日常工具服务。项目采用前后端分离架构，前端使用 Vue 3 + Vite，后端使用 Go + Gin 框架。

## 功能模块

| 模块 | 路径 | 描述 |
|------|------|------|
| 首页 | `/` | 天气查询、留言板、日历、每日一言 |
| 照片墙 | `/photo` | 地球观察日记 - 照片展示与上传 |
| 留言本 | `/messageList` | 路人甲的待回留言本 |
| 笔记系统 | `/markDownPage` | 小白的碎片笔记手记 |
| 新闻 | `/news` | 吃瓜人的日常新闻录 |
| 房屋信息 | `/house` | 牛马人的一生之敌 - 房价查询与房贷计算 |
| 订单管理 | `/order` | 流水管理 |
| AI 搜索 | 顶部搜索栏 | DeepSeek 智能对话 |

## 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 组件库**: Element Plus
- **图表**: ECharts
- **编辑器**: mavon-editor (Markdown)
- **路由**: vue-router
- **状态管理**: Pinia
- **日期处理**: dayjs

### 后端
- **语言**: Go
- **框架**: Gin
- **数据库**: MySQL + GORM
- **认证**: JWT

## 快速开始

### 前端启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 后端启动

```bash
cd rich_zhang
go run main.go
```

## 项目结构

```
rich_chen_r/
├── src/
│   ├── views/           # 页面组件
│   │   ├── Home.vue     # 首页
│   │   ├── Login.vue    # 登录页
│   │   ├── Photo.vue    # 照片墙
│   │   ├── Message.vue  # 留言列表
│   │   ├── MarkDown.vue # 笔记
│   │   ├── News.vue     # 新闻
│   │   ├── House.vue    # 房屋信息
│   │   └── Order.vue    # 订单
│   ├── components/      # 公共组件
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 状态管理
│   ├── utils/          # 工具函数
│   └── assets/         # 静态资源
├── package.json
└── vite.config.ts
```

---

# 主题风格指南

## 设计理念

本项目定位为**个人工具类生活平台**，设计风格追求 **简洁、实用、略带温度**，避免过度花哨，强调功能性与美观性的平衡。

## 配色方案

### 侧边栏装饰球

| 位置 | 颜色 | 透明度 |
|------|------|--------|
| 右上 | 橙色 `#ffb779` | 40% |
| 左下 | 浅蓝 `#87cefa` | 50% |
| 右下 | 粉色 `#ffb6c1` | 40% |

> 装饰球效果: `filter: blur(50px)` + `animation: float`

### 主色调

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色 | 深海蓝 | `#2c3e50` |
| 辅助色 | 天空蓝 | `#3498db` |
| 强调色 | 活力橙 | `#e67e22` |
| 成功色 | 翠绿 | `#27ae60` |
| 警告色 | 柠檬黄 | `#f39c12` |
| 危险色 | 珊瑚红 | `#e74c3c` |

### 浅色主题 (默认)

```css
:root {
  /* 背景色 */
  --bg-primary: #f0f2f5;      /* 主背景 - 浅灰 */
  --bg-secondary: #ffffff;    /* 卡片背景 */
  --bg-sidebar: linear-gradient(180deg, #e8f4fc 0%, #d4e9f7 50%, #f5e6ff 100%); /* 侧边栏 - 阳光渐变 */

  /* 文字色 */
  --text-primary: #2c3e50;    /* 主标题 */
  --text-secondary: #5a6c7d;  /* 侧边栏导航 */
  --text-placeholder: #c0c4cc;/* 占位符 */

  /* 边框色 */
  --border-color: #ebeef5;
  --border-light: #f0f2f5;

  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-glass: 0 8px 32px rgba(31, 38, 135, 0.15); /* 玻璃效果 */

  /* 主题色 */
  --primary: #2c3e50;
  --accent: #3498db;
  --accent-gradient: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
}
```

### 深色主题 (可选)

```css
.dark-theme {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-sidebar: rgba(22, 33, 62, 0.85);

  --text-primary: #e8e8e8;
  --text-secondary: #a0a0a0;
  --text-placeholder: #6c6c6c;

  --border-color: #2a3f5f;
}
```

## 字体规范

| 用途 | 字体 | 字号 | 字重 |
|------|------|------|------|
| 页面标题 | Inter, system-ui | 24px | 600 |
| 卡片标题 | Inter, system-ui | 18px | 600 |
| 正文 | Inter, system-ui | 14px | 400 |
| 辅助文字 | Inter, system-ui | 12px | 400 |
| 代码/等宽 | JetBrains Mono, monospace | 13px | 400 |

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

## 间距系统

采用 4px 基准网格：

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

## 组件风格

### 按钮

- 圆角: `6px`
- 内边距: `12px 20px`
- 过渡: `all 0.2s ease`

### 卡片

- 圆角: `12px`
- 阴影: `--shadow-sm` (hover 时 `--shadow-md`)
- 内边距: `20px`
- 背景: 白色，带轻微玻璃效果

### 侧边栏 (阳光风格)

- 宽度: `260px`
- 背景: 阳光渐变 `#e8f4fc` → `#d4e9f7` → `#f5e6ff`
- 装饰: 模糊圆形动画（橙/蓝/粉色）
- 文字色: `#2c3e50` (深灰)
- 激活项: 蓝色渐变 `#3498db` → `#5dade2` + 发光阴影
- 头像: 白色边框 + 旋转渐变光环
- 底部: 实时时钟显示

### 输入框

- 圆角: `8px`
- 高度: `36px` (默认)
- 边框: `1px solid var(--border-color)`
- focus 效果: 主色边框 + 轻微阴影

## 动效规范

| 场景 | 效果 | 时长 |
|------|------|------|
| 页面切换 | fade + slide | 300ms |
| 按钮 hover | scale(1.02) + 阴影 | 200ms |
| 卡片 hover | 阴影增强 + translateY(-2px) | 200ms |
| 侧边栏展开 | slide | 250ms |
| 消息通知 | slideInRight | 300ms |

```css
/* 推荐过渡曲线 */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* Material Design 标准 */
```

## 模块特色配色

为不同功能模块分配专属色彩，便于快速识别：

| 模块 | 主题色 | 使用场景 |
|------|--------|----------|
| 首页/天气 | `#3498db` (蓝) | 天气卡片、首页元素 |
| 照片墙 | `#9b59b6` (紫) | 照片展示、图集 |
| 笔记 | `#27ae60` (绿) | 笔记编辑、Markdown |
| 留言 | `#e67e22` (橙) | 留言列表、输入框 |
| 房屋 | `#e74c3c` (红) | 房价图表、计算器 |
| 订单 | `#1abc9c` (青) | 账单流水、统计 |
| AI 对话 | `#7289da` (靛) | 搜索框、对话气泡 |

## 图标使用

- 主要使用 **Element Plus Icons**
- 辅以 **ECharts** 内置图标
- 图标尺寸: `18px` (导航), `20px` (按钮), `24px` (大图标)

## 响应式断点

```css
--breakpoint-sm: 768px;   /* 手机横屏 */
--breakpoint-md: 992px;   /* 平板 */
--breakpoint-lg: 1200px;  /* 桌面 */
--breakpoint-xl: 1920px;  /* 大屏 */
```

## 开发注意事项

1. **组件命名**: 使用 PascalCase (如 `WeatherCard.vue`)
2. **CSS 类名**: 使用 kebab-case，使用 BEM 命名规范
3. **颜色变量**: 优先使用 CSS 变量，避免硬编码颜色
4. **动画性能**: 优先使用 `transform` 和 `opacity`
5. **无障碍**: 确保颜色对比度符合 WCAG 标准

## 更新日志

### v1.0.0
- 初始版本
- 集成天气、笔记、照片、房屋查询等核心功能
- AI 对话集成 (DeepSeek)
- 实时消息推送 (SSE)
