# VideoHub - 灵感监控中心

基于 PRD 文档构建的竞品视频监控与分析平台。

## 技术栈

- **Vite** - 构建工具
- **React 18** - UI 框架
- **TypeScript** - 类型系统
- **Tailwind CSS** - 样式管理
- **lucide-react** - 图标库
- **framer-motion** - 动画库

## 项目结构

```
src/
├── components/          # React 组件
│   ├── Dashboard.tsx    # 主仪表盘页面
│   ├── Sidebar.tsx      # 左侧导航栏
│   ├── FreshDrops.tsx   # Fresh Drops 横向滚动区域
│   ├── BentoGrid.tsx    # Bento Grid 功能网格
│   └── DiscoveryFeed.tsx # 瀑布流猜你喜欢
├── data/               # Mock 数据
│   └── mockData.ts
├── types/              # TypeScript 类型定义
│   └── index.ts
├── App.tsx             # 根组件
├── main.tsx            # 入口文件
└── index.css           # 全局样式
```

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 预览构建结果

```bash
npm run preview
```

## 设计规范

- **主题**: 沉浸式深色模式 (Immersive Dark Mode)
- **背景色**: slate-950 (#020617)
- **文字色**: slate-50 (#f8fafc)
- **主色调**: 
  - Neon Purple (#8b5cf6) - 按钮、高亮状态
  - Electric Blue (#3b82f6) - 参考类标签
- **圆角**: rounded-xl (大圆角)
- **质感**: 微弱边框 (border-slate-800)，Hover 时发光效果

## 功能特性

### 首页 - 灵感监控中心

1. **左侧侧边栏**: 包含仪表盘、情报库、采集、标签管理等菜单
2. **Fresh Drops**: 横向滚动的竞品速递区域，展示近 24 小时内的新视频
3. **Bento Grid**: 功能网格布局
   - 趋势卡：显示 SaaS 视频流行趋势
   - 采集卡：一键录入链接
   - 入口卡：快速跳转到收藏夹
4. **猜你喜欢**: 瀑布流风格的视频推荐

## 下一步开发

- [ ] 实现视频详情拆解台
- [ ] 实现极速采集录入功能
- [ ] 实现标签管理体系
- [ ] 对接 API 实现竞品自动抓取
- [ ] 实现脚本自动拆解与视觉风格自动识别
