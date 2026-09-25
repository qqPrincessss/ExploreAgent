# Claude.com 设计语言提取报告

> 基于 claude.com 官方网站前端产物的设计令牌（Design Token）逆向提取与系统化整理

---

## 文档信息

| 项目 | 内容 |
| --- | --- |
| 文档名称 | Claude.com 设计语言提取报告 |
| 提取对象 | `https://claude.com/` 首页及其全站样式产物 |
| 提取日期 | 2026-09-25 |
| 文档版本 | v1.0 |
| 提取方法 | 静态产物解析（HTML + 样式分片） |
| 数据性质 | 一手令牌值，非目测估值 |
| 完整度 | 设计基础层（色彩／字体／尺度／空间／圆角／动效）完整；组件层部分完整 |

---

## 摘要

Claude.com 的视觉语言由一套**高度克制、结构清晰的分层令牌系统**支撑。其核心特征可归纳为五点：

1. **暖中性色体系**：全站灰阶共 21 级，全部带有黄绿底色偏，浅色主题背景取 `#faf9f5` 而非纯白，深色主题背景取 `#141413` 而非纯黑。这是该品牌"米色质感"的唯一来源。
2. **色彩高度节制**：13 个品牌点缀色全部以自然物命名（clay／sky／olive／plum 等），均用于插图与图标等装饰性场景；界面骨架一律使用暖灰，唯一进入交互层的颜色是 `clay`。
3. **自有字体三件套**：anthropicSans／anthropicSerif／anthropicMono，配合 `size-adjust` 校准的字体回退策略；排版尺度中每一个级别均提供 sans 与 serif 双轨变体。
4. **非标准字重 480**：全站出现频次高于 500，是按钮与次级文本的主力字重，也是该设计语言最具辨识度的细节之一。
5. **语义令牌与主题作用域分离**：`--color-*`（原始层）→ `--theme-*`（语义层）→ `.theme-main` / 深色作用域（主题层），组件仅引用语义层，实现单类名整体换肤。

---

## 1. 研究方法与数据来源

### 1.1 采集路径说明

`claude.com` 在浏览器环境中会通过客户端脚本重定向至登录页（`claude.ai/login`），无法直接获取渲染后的计算样式。因此本报告的采集方式调整为：**直接解析站点静态产物**，即首页 HTML 文档与全部样式分片文件。

该方式的优势在于所提取的数值为样式表原始声明值，不受运行时环境、浏览器默认样式与视口差异干扰，其精度高于计算样式采集。

### 1.2 提取手段

- 解析 HTML 文档中引用的全部样式表资源
- 提取全部 CSS 自定义属性声明（含原始层、语义层、主题作用域三层）
- 提取全部 `@font-face` 声明与字体资源引用
- 对全量样式规则中的关键属性（字号、行高、字距、字重、圆角、阴影、过渡、缓动、最大宽度）进行去重统计，以频次反映实际使用权重
- 提取 HTML 中的类名分布，用于还原组件构成与命名体系

### 1.3 数据可信度分级

本报告中的数据按可信度分为三档：

| 标记 | 含义 |
| --- | --- |
| **【实测】** | 直接从样式表或 HTML 中读取的一手声明值 |
| **【归纳】** | 基于多个实测值的分布规律总结得出的结论 |
| **【推断】** | 基于类名结构、令牌命名与上下文做出的合理推测，未经完整规则验证 |

---

## 2. 技术实现概览

| 维度 | 实况 |
| --- | --- |
| 应用框架 | Next.js（产物路径含 `/_next/static/chunks/`） |
| 样式方案 | CSS Modules（SCSS），类名形如 `Button-module-scss-module__hash__name` |
| 令牌载体 | CSS 自定义属性（CSS Custom Properties） |
| 工具类 | 存在少量全局工具类，如 `.container`、`.text-body-3`、`.text-display-1-serif` |
| 原子化框架 | **未使用** Tailwind 或同类原子化方案 |
| 字体托管 | 自有 woff2 资源，经 `@font-face` 本地声明 |

**工程启示【归纳】**：该站点选择"语义化类名 + 令牌驱动变量"而非原子化类名堆叠，其设计系统的可维护性由令牌层承载，而非由工具类承载。这一取向与本报告关注的令牌体系本身高度一致。

---

## 3. 设计基础体系

### 3.1 字体系统

#### 3.1.1 字体族构成【实测】

站点使用三套自有字体，各含正体与斜体两个字重文件：

```css
--font-anthropic-sans:  "anthropicSans","anthropicSans Fallback";   /* 正文与界面 */
--font-anthropic-serif: "anthropicSerif","anthropicSerif Fallback";  /* 大标题与展示文字 */
--font-anthropic-mono:  "anthropicMono","anthropicMono Fallback";    /* 代码与标签 */
```

字体资源文件：

| 字体族 | 正体 | 斜体 |
| --- | --- | --- |
| anthropicSans | `AnthropicSans_Roman_Web.woff2` | `AnthropicSans_Italic_Web.woff2` |
| anthropicSerif | `AnthropicSerif_Roman_Web.woff2` | `AnthropicSerif_Italic_Web.woff2` |
| anthropicMono | `AnthropicMono_Roman_Web.woff2` | `AnthropicMono_Italic_Web.woff2` |

全部采用 `font-display: swap`。

#### 3.1.2 字体回退策略【实测】

该站在字体回退层做了一项值得借鉴的处理：为每套自有字体构造一个"度量校准回退族"，以 `Arial` 为基，通过 `size-adjust` 与 `ascent-override` / `descent-override` 覆盖，使回退字体的字面尺寸与自有字体对齐，从而消除字体加载完成前后的布局跳动（CLS）。

| 回退族 | 基字体 | size-adjust | ascent-override | descent-override |
| --- | --- | --- | --- | --- |
| anthropicSans Fallback | Arial | 106.73% | 92.99% | 24.13% |
| anthropicSerif Fallback | Arial | 103.33% | 96.05% | 24.92% |

实际应用的字体回退链为：

```css
/* 无衬线 */
font-family: var(--font-anthropic-sans), system-ui, sans-serif;
/* 衬线 */
font-family: var(--font-anthropic-serif), Georgia, serif;
/* 等宽 */
font-family: var(--font-anthropic-mono), ui-monospace, monospace;
```

#### 3.1.3 OpenType 特性【实测】

全部排版工具类统一启用以下特性，用于保证数字对齐与连字表现：

```css
font-feature-settings: "pnum" on, "lnum" on, "liga" on;
/* pnum 比例数字 / lnum  lining figures / liga 标准连字 */
```

此外，页面根作用域设置了可变字体光学尺寸：

```css
font-variation-settings: "opsz" 16;
```

#### 3.1.4 字重体系【实测】

| 令牌 | 值 | 用途【归纳】 |
| --- | --- | --- |
| `--font-weight-light` | 300 | 极少使用 |
| `--font-weight-regular` | 400 | 正文 |
| — | **480** | **按钮、次级文本主力字重** |
| `--font-weight-medium` | 500 | 标题、强调、深色主题按钮 |
| `--font-weight-semibold` | 600 | 最小一级标题（headline-6） |
| `--font-weight-bold` | 700 | 未见于声明 |

**要点【归纳】**：`480` 这一非标准字重在全量样式中的出现频次高于 `500`，是该设计语言在排版层面最显著的特征。其价值在于：在常规字体（Quartz 梯度）下，400 偏轻、500 偏重，480 恰好落在视觉"中等偏轻"的区间，使按钮文字在浅色主题中既有分量又不显笨重。深色主题下按钮字重则提升至 500，以补偿暗底反白带来的视觉变细。

---

### 3.2 色彩系统

#### 3.2.1 中性色阶（Warm Gray Scale）【实测】

站点定义了 21 级中性色，命名自 `gray-000` 至 `gray-1000`。**全部色值带有明显的黄绿底色偏**，而非通用的中性灰或冷灰。

| 令牌 | 色值 | 定位 |
| --- | --- | --- |
| `--color-gray-000` | `#ffffff` | 纯白 |
| `--color-gray-050` | `#faf9f5` | **浅色主题一级背景** |
| `--color-gray-100` | `#f5f4ed` | 浅色主题二级背景 |
| `--color-gray-150` | `#f0eee6` | 浅色主题三级背景 |
| `--color-gray-200` | `#e8e6dc` | 浅色次级按钮底 |
| `--color-gray-250` | `#dedcd1` | 浅色次级描边 |
| `--color-gray-300` | `#d1cfc5` | 浅色次级描边（深） |
| `--color-gray-350` | `#c2c0b6` | 浅色次级文本 |
| `--color-gray-400` | `#b0aea5` | 浅色一级描边 |
| `--color-gray-450` | `#9c9a92` | 浅色三级文本 |
| `--color-gray-500` | `#87867f` | 浅色三级文本（深） |
| `--color-gray-550` | `#73726c` | 深色一级描边 |
| `--color-gray-600` | `#5e5d59` | 浅色三级文本主力 / 深色一级描边 |
| `--color-gray-650` | `#4d4c48` | 浅色次级按钮文字 |
| `--color-gray-700` | `#3d3d3a` | 深色二级描边 |
| `--color-gray-750` | `#30302e` | 浅色二级文本 / 深色三级背景 |
| `--color-gray-800` | `#262624` | 深色三级背景 |
| `--color-gray-850` | `#1f1e1d` | 深色一级背景（备选） |
| `--color-gray-900` | `#1a1918` | 深色二级背景 |
| `--color-gray-950` | `#141413` | **深色主题一级背景** |
| `--color-gray-1000` | `#000000` | 纯黑 |

**设计意图【归纳】**：以 `#faf9f5` 替代 `#ffffff` 作为页面底色，并在暗色端以 `#141413` 替代 `#000000`，使界面整体呈现纸感与暖度，规避纯白／纯黑带来的刺目感与技术冷感。这是该品牌视觉辨识度的主要来源。

#### 3.2.2 品牌点缀色【实测】

13 个点缀色全部采用自然物命名，整体低饱和度、中高明度，色彩之间保持相近的"灰调"质感，可任意组合而无冲突。

| 令牌 | 色值 | 语义联想 |
| --- | --- | --- |
| `--color-clay` | `#d97757` | 陶土（主品牌色） |
| `--color-clay-dark` | `#c46849` | 陶土·深 |
| `--color-clay-hover` | `#c6613f` | 陶土·悬停 |
| `--color-oat` | `#e3dacc` | 燕麦 |
| `--color-peach` | `#ebc9b7` | 蜜桃 |
| `--color-coral` | `#ebcece` | 珊瑚 |
| `--color-fig` | `#c46686` | 无花果 |
| `--color-plum` | `#827dbd` | 李子 |
| `--color-heather` | `#cbcadb` | 石楠 |
| `--color-sky` | `#6a9bcc` | 天空 |
| `--color-cactus` | `#bcd1ca` | 仙人掌 |
| `--color-mineral` | `#629987` | 矿石 |
| `--color-olive` | `#788c5d` | 橄榄 |

#### 3.2.3 语义色【实测】

| 令牌 | 值 | 说明 |
| --- | --- | --- |
| `--color-error` | `#bf4d43` | 错误态，并非高饱和正红，仍属暖调 |
| `--color-focus` | `var(--color-clay-dark)` | **焦点环路颜色直接取品牌色** |

#### 3.2.4 用色原则【归纳】

1. **彩色不进入界面骨架**。背景、文字、描边、分隔线全部使用暖灰阶。
2. **彩色仅用于装饰与标识**。插图、图标、标记（marker）使用点缀色，由 `--theme-accent-pictogram` 统一调度（浅色主题取 `oat`，深色主题取 `gray-600`）。
3. **唯一进入交互层的颜色是 clay**。用于焦点环路与外扩描边，使键盘可达性反馈与品牌色绑定。
4. **错误色保持暖调**（`#bf4d43` 而非 `#e5484d` 类正红），与整体暖色体系不冲突。

---

### 3.3 排版尺度（Type Scale）

#### 3.3.1 尺度构成【实测】

全部字号采用 `clamp()` 流体声明，随视口宽度连续变化。尺度分为四组：展示级（display）、标题级（headline）、大字正文级（body-large）、正文级（body），另有标签级（caption）。

| 级别 | 字号声明 | 默认字重 | 行高 |
| --- | --- | --- | --- |
| `display-1` | `clamp(42px, 33.429px + 2.679vw, 72px)` | 500 | 1.1 |
| `display-2` | `clamp(36px, 28px + 2.5vw, 64px)` | 500 | 1.1 – 1.2 |
| `headline-1` | `clamp(34px, 28.857px + 1.607vw, 52px)` | 500 | 1.2 |
| `headline-2` | `clamp(30px, 26px + 1.25vw, 44px)` | 500 | 1.2 – 1.3 |
| `headline-3` | `clamp(28px, 25.714px + 0.714vw, 36px)` | 500 | 1.1 – 1.3 |
| `headline-4` | `clamp(23px, 20.429px + 0.804vw, 32px)` | 500 | 1.1 – 1.5 |
| `headline-5` | `clamp(20px, 18.571px + 0.446vw, 25px)` | 500 | 1.2 |
| `headline-6` | `clamp(16px, 15.143px + 0.268vw, 19px)` | **600** | 1.2 |
| `body-large-1` | `clamp(22px, 21.429px + 0.179vw, 24px)` | 400 | 1.5 – 1.7 |
| `body-large-2` | `clamp(20px, 19.143px + 0.268vw, 23px)` | 400 | 1.5 – 1.7 |
| `body-1` | `clamp(19px, 18.714px + 0.089vw, 20px)` | 400 | 1.5 – 1.7 |
| `body-2` | `17px` | 400 | 1.5 – 1.7 |
| `body-3` | `15px` | 400 | 1.5 – 1.7 |
| `caption` | `12px`（`letter-spacing: 0.01em`） | 400 | 1.5 – 1.7 |

> **说明【实测】**：部分级别（如 `display-1`、`display-2`、`headline-2`、`headline-3`）在样式表中存在**两套并行的 clamp 声明**（例如 `display-1` 另有 `clamp(36px, 28px + 2.5vw, 64px)`）。这通常意味着不同页面模块使用了不同的响应式基准档位，而非同一级别的冗余定义。上表收录的是其中较高一档。

#### 3.3.2 字号与行高的解耦【归纳】

行高未与字号硬编码绑定，而是抽为 7 档独立令牌，各级字号按语义场景挂载：

| 令牌 | 值 | 适用场景【归纳】 |
| --- | --- | --- |
| `--line-height-tight` | 1 | 单行标签 |
| `--line-height-tighter` | 1.1 | 展示级标题 |
| `--line-height-snug` | 1.2 | 标题级 |
| `--line-height-normal` | 1.3 | 短标题 |
| `--line-height-relaxed` | 1.5 | 大字正文 |
| `--line-height-loose` | 1.6 | 正文 |
| `--line-height-looser` | 1.7 | 长正文 |

这一设计的价值在于：**同一字号可在不同语境下切换行高而不改变字号**，例如 `body-3` 在卡片描述中取 1.6，在密集列表中可降至 1.2。

#### 3.3.3 sans / serif 双轨制【实测】

排版尺度的每一项都提供两个变体类，阶梯数值完全相同，仅字体族不同：

```css
.text-body-1        /* anthropicSans */
.text-body-1-serif  /* anthropicSerif */
.text-headline-4        /* anthropicSans，字重 500 */
.text-headline-4-serif  /* anthropicSerif，字重 500 */
```

唯一的例外是 `headline-6-serif`，其字重从 sans 版的 600 下调为 500，以补偿衬线体在同等字重下的视觉加重。

**应用实例【实测】**：首页主标题使用 `text-display-1-serif` 并附加 `text-wrap: balance` 以优化多行断句。

**设计意图【归纳】**：字号与字体解耦后，编辑可以自由组合"衬线大标题 + 无衬线正文"的经典出版式排版，而无需为每种组合单独定义字号，这在保证视觉节奏统一的同时极大压缩了令牌数量。

#### 3.3.4 可读宽度令牌【实测】

站点为不同文本类型预定义了字符宽度上限，属于较少见但极其实用的排版令牌：

| 令牌 | 值 | 适用 |
| --- | --- | --- |
| `--text-width-narrow` | 20ch | 极窄标注 |
| `--text-width-headline` | 30ch | 大标题 |
| `--text-width-title` | 45ch | 小标题 |
| `--text-width-body` | 60ch | 正文（主力） |
| `--text-width-wide` | 70ch | 宽正文 |
| `--text-width-prose` | 80ch | 长文阅读 |

`--text-width-body`（60ch）在样式表中的使用频次仅次于 `max-width: 100%`，是正文段落的标准约束。

---

### 3.4 空间系统（Spacing）【实测】

间距令牌共 17 档，命名规则为 `--sp-{像素值}`：

```
2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 80 · 96 · 128 · 200
```

**规律【归纳】**：

- 并非严格的 4 倍数制，`6` / `12` / `20` 为常规成员
- 8 以下为微调档（图标与文字间隙、描边偏移）
- 8 – 24 为组件内档（按钮内边距、卡片内边距）
- 32 – 64 为区块内档（模块间垂直节奏）
- 80 – 200 为页面级档（首屏留白、区块分隔）

**令牌直接以数值命名**而非语义命名（如 `--sp-8` 而非 `--space-sm`），说明该体系倾向于在令牌层保持中性，由使用方决定语义，避免出现"`--space-lg` 到底多大"的语义漂移问题。

---

### 3.5 圆角系统（Radius）【实测】

```css
--br-2: 2px;   --br-4: 4px;   --br-6: 6px;   --br-8: 8px;
--br-12: 12px; --br-16: 16px; --br-24: 24px; --br-32: 32px;
--br-48: 48px; --br-64: 64px;
```

使用分布【实测】（按声明频次）：

| 令牌 | 频次 | 推断用途 |
| --- | --- | --- |
| `--br-16` | 33 | 卡片、面板 |
| `--br-8` | 23 | **按钮**、输入框、小卡片 |
| `--br-12` | 22 | 下拉面板、次级容器 |
| `--br-24` | 18 | 大区块、插图容器 |
| `--br-4` | 12 | 标签、徽标 |
| `--br-32` | 6 | 特大型容器 |

另有 `border-radius: 999px` 用于胶囊形控件，`50%` 用于头像与圆形图标。

---

### 3.6 阴影与高度（Elevation）【实测】

阴影体系极为克制，仅 3 档，且透明度极低（4% 至 10%），强调"轻浮起"而非"强投影"：

```css
--shadow-sm: 0 2px  8px #0000000a;   /* 10% 透明度 hex 写法 ≈ 3.9% */
--shadow-md: 0 4px 20px #0000000a;
--shadow-lg: 0 4px 16px #0000001a;   /* ≈ 10.2% */
```

此外存在一处零散的对话框阴影：`0 4px 24px #0000000d`。

**悬停态的高度表达【实测】**：组件悬停**不改变阴影深度，也不做位移**，而是通过 `box-shadow` 绘制外扩描边环：

```css
/* 静默态 */
box-shadow: 0 0 0 0 var(--theme-button-primary-bg);
/* 悬停态 */
box-shadow: 0 0 0 2px var(--theme-button-primary-bg);
/* 次级按钮（用描边环模拟 1px 边框，规避布局抖动） */
box-shadow: 0 0 0 1px var(--theme-button-secondary-bg),
            0 0 0 2px var(--theme-border-secondary);
```

**设计意图【归纳】**：使用外扩环而非位移／加深阴影，好处有二——其一，`box-shadow` 不参与布局计算，悬停时不会触发重排；其二，环的尺寸与元素本身尺寸无关，在任何尺寸的控件上都能保持一致的视觉反馈强度。

---

### 3.7 动效与缓动（Motion）【实测】

#### 3.7.1 缓动曲线

站点定义 8 条贝塞尔曲线，均以"幂次 + 方向"命名：

| 令牌 | 值 | 特征 |
| --- | --- | --- |
| `--ease-out-quart` | `cubic-bezier(0.165, 0.84, 0.44, 1)` | 出场主力，收尾柔和 |
| `--ease-out-expo` | `cubic-bezier(0.19, 1, 0.22, 1)` | 出场，前段极快 |
| `--ease-out-power2` | `cubic-bezier(0.25, 1, 0.5, 1)` | 出场，力度适中 |
| `--ease-in-quart` | `cubic-bezier(0.895, 0.03, 0.685, 0.22)` | 入场 |
| `--ease-in-out-quart` | `cubic-bezier(0.77, 0, 0.175, 1)` | 双向，进出对称 |
| `--ease-in-out-power3` | `cubic-bezier(0.645, 0.045, 0.355, 1)` | 双向 |
| `--ease-in-out-power2` | `cubic-bezier(0.455, 0.03, 0.515, 0.955)` | 双向，对称性最好 |
| `--ease-in-out-expo` | `cubic-bezier(1, 0, 0, 1)` | 双向，极强加减速 |

#### 3.7.2 时长与属性分工

| 属性 | 时长 | 缓动 |
| --- | --- | --- |
| `color` | 0.1s | `ease-in-out` |
| `background-color` | 0.2s | `ease-in-out` |
| `border-color` | 0.2s | `ease-in-out` |
| `box-shadow` | 0.2s | `ease-in-out` |
| `opacity` | 0.2s / 0.4s | 线性或 `ease` |
| `transform` | 0.16s / 0.25s / 0.3s | `ease-out` 或 `ease-out-quart` |

**规律【归纳】**：

- **颜色类属性一律短时长（0.1 – 0.2s）**，保证交互反馈的即时感
- **位移动画略长（0.25 – 0.3s）**，配合出场曲线获得"缓停"质感
- `transition: none` 的出现频次最高（29 次），说明该站点**主动禁用**了大量默认过渡，而非全局开启

#### 3.7.3 滚动入场【推断】

HTML 中存在 `AnimatedReveal` 模块容器，携带内联变量：

```html
style="--reveal-y: 10px; --reveal-duration: ..."
```

可推断其实现为：元素初始状态向下偏移 10px 并降低透明度，进入视口后位移归零并显现。位移幅度仅 10px，属"轻微浮入"而非"弹跳入场"，与整体克制的动效语言一致。

---

## 4. 令牌体系架构

### 4.1 三层结构【实测】

该站点的令牌体系分为严格的三层，这是其设计系统可维护性的核心：

```
第一层  原始层（Primitive）
         --color-gray-050 / --color-clay / --br-8 / --sp-16
         特点：与语义无关，仅描述"这是什么值"
              ↓
第二层  语义层（Semantic）
         --theme-background-primary / --theme-foreground-secondary
         --theme-button-primary-bg / --theme-border-primary
         特点：描述"用在哪里"，是组件唯一可引用的层
              ↓
第三层  主题作用域（Theme Scope）
         通过 .theme-main / 深色作用域类，一次性重定义全部语义层变量
         特点：切换主题 = 切换一个类名
```

### 4.2 浅色与深色主题对照【实测】

| 语义令牌 | 浅色主题 | 深色主题 |
| --- | --- | --- |
| `--theme-background-primary` | `gray-050` `#faf9f5` | `gray-950` `#141413` |
| `--theme-background-secondary` | `gray-100` `#f5f4ed` | `gray-900` `#1a1918` |
| `--theme-background-tertiary` | `gray-150` `#f0eee6` | `gray-800` `#262624` |
| `--theme-background-overlay` | `gray-000` `#ffffff` | `gray-900` `#1a1918` |
| `--theme-foreground-primary` | `gray-950` `#141413` | `gray-050` `#faf9f5` |
| `--theme-foreground-secondary` | `gray-750` `#30302e` | `gray-400` `#b0aea5` |
| `--theme-foreground-tertiary` | `gray-600` `#5e5d59` | `gray-500` `#87867f` |
| `--theme-border-primary` | `gray-400` `#b0aea5` | `gray-600` `#5e5d59` |
| `--theme-border-secondary` | `gray-300` `#d1cfc5` | `gray-700` `#3d3d3a` |
| `--theme-border-tertiary` | `gray-200` `#e8e6dc` | `gray-750` `#30302e` |
| `--theme-accent-clay-primary` | `clay` `#d97757` | `clay-dark` `#c46849` |
| `--theme-accent-clay-interactive` | `clay-hover` `#c6613f` | `clay-hover` `#c6613f` |
| `--theme-accent-pictogram` | `oat` `#e3dacc` | `gray-600` `#5e5d59` |
| `--theme-button-primary-bg` | `gray-950` | `gray-050` |
| `--theme-button-primary-fg` | `gray-050` | `gray-950` |
| `--theme-button-primary-font-weight` | **480** | **500** |
| `--theme-button-secondary-bg` | `gray-200` | `gray-750` |
| `--theme-button-secondary-fg` | `gray-650` | `gray-050` |
| `--theme-button-secondary-border` | `gray-200` | `gray-750` |
| `--theme-button-secondary-font-weight` | 500 | **480** |
| `--theme-button-tertiary-bg` | `gray-200` | `gray-800` |
| `--theme-button-tertiary-fg` | `gray-600` | `gray-050` |
| `--theme-button-tertiary-font-weight` | 500 | **480** |
| `--theme-button-clay-bg` / `-border` | `clay-hover` | `clay-hover` |
| `--theme-button-clay-fg` | `gray-000` | `gray-000` |
| `--theme-button-clay-font-weight` | 500 | **480** |
| `--theme-input-bg` | `gray-000` | `gray-800` |
| `--theme-input-placeholder` | `gray-600` | `gray-500` |
| `--theme-input-text` | `gray-950` | `gray-050` |
| `--theme-switch-bg` | `gray-150` | `gray-800` |
| `--theme-switch-primary-bg-selected` | `gray-950` | `gray-650` |
| `--theme-switch-secondary-bg-selected` | `--color-focus` | `--color-focus` |

### 4.3 值得注意的两个细节【归纳】

**其一：字重属于主题令牌。** 按钮字重随主题切换而变化（浅色 480 / 深色 500，secondary 与 tertiary 则相反），这在通用设计系统中极为罕见。其动因在于：反白文字在暗底上会产生"视觉变细"的错觉（光学膨胀效应），需要提升字重补偿；而浅色主题中 480 已足够。

**其二：深色主题并非浅色主题的机械反转。** 多处映射不构成对偶关系，例如：

- `--theme-switch-primary-bg-selected`：浅色用 `gray-950`，深色用 `gray-650`（而非 `gray-050`）
- `--theme-accent-clay-primary`：浅色用 `clay`，深色降一档用 `clay-dark`
- `--theme-accent-pictogram`：浅色用彩色 `oat`，深色改用中性 `gray-600`

说明该深色主题经过独立调校，而非算法生成。

---

## 5. 组件规范

### 5.1 按钮（Button）

按钮是该站点规则最完整、最具代表性的组件。以下为可直接复用的完整规格。

#### 5.1.1 基础样式【实测】

```css
/* 结构 */
display: inline-flex;
align-items: center;
justify-content: center;
text-align: center;
border: none;
cursor: pointer;
text-decoration: none;

/* 尺寸与形状 */
min-width: 44px;            /* 触控目标下限 */
line-height: 1;
border-radius: var(--br-8);

/* 字体 */
font-family: var(--font-anthropic-sans), system-ui, sans-serif;
font-feature-settings: "pnum" on, "lnum" on, "liga" on;

/* 过渡 */
transition: color .1s ease-in-out,
            background-color .2s ease-in-out,
            border-color .2s ease-in-out,
            box-shadow .2s ease-in-out;
```

#### 5.1.2 尺寸档位【实测】

| 档位 | 高度 | 内边距 | 图标间距 | 图标尺寸 | 尾图标补偿 |
| --- | --- | --- | --- | --- | --- |
| `small` | 28px | `4px 12px` | 4px | 16px | — |
| `medium` | 36px | `8px 12px` | 8px | 18px | `padding-left: 16px` |
| `large` | 40px | `8px 16px` | 8px | 20px | `padding-left: 24px` |

**"尾图标补偿"机制【归纳】**：当按钮带图标时，有图标一侧的内边距会被收紧（改为无图标侧数值的一半左右），使图标与文字在视觉上居中。这是保证"文本按钮"与"图文按钮"视觉重量一致的关键处理。

图标容器为固定尺寸的 flex 容器，内部 `svg` 撑满 100%。

#### 5.1.3 变体与状态【实测】

四个变体：`primary` / `secondary` / `tertiary` / `clay`，各自通过一组语义令牌驱动（见 4.2 对照表）。

| 状态 | 处理 |
| --- | --- |
| 静默 | `box-shadow: 0 0 0 0 {bg}` |
| 悬停 | `box-shadow: 0 0 0 2px {bg}` — 外扩 2px 同色环 |
| 键盘聚焦 | `outline: 2px solid var(--color-focus); outline-offset: 4px` |
| 禁用 | `opacity: .5; cursor: not-allowed` |

**要点【归纳】**：悬停**不改变背景色**——`background-color` 保持静默态色值，仅通过外扩环表达状态。这是整套组件体系中最反直觉、也最有辨识度的一条规则。焦点环路使用品牌 clay 色并外移 4px，确保在任何底色上都清晰可见。

#### 5.1.4 其他组件（构成概览）【推断】

依据 HTML 类名分布，该站点组件体系还包括：

| 组件 | 类名特征 | 说明 |
| --- | --- | --- |
| 下拉菜单 | `Dropdown-module` | 含 `list` / `content` / `body` / `column` / `columns` / `horizontalGroup` / `verticalSeparator`，支持多列与横向分组 |
| 导航下拉 | `NavDropdown-module` | 含 `trigger` / `panel` / `caret` |
| 页脚 | `Footer-module` | 含 `sectionTitle` / `sectionItems` / `sectionLink` / `desktopColumn` |
| 套餐卡片 | `Plans-module` | 含 `card` / `planName` / `planSubtitle` / `price` / `priceNote` / `features` / `feature` / `checkIcon` / `divider` / `disclaimer` / `cta` / `pictogram` |
| 插图 | `Illustration-module` | 含 `base` / `pictogram`，尺寸分 `size-medium` 等 |
| 登录卡片 | `LoginCard-module` | 含 `secondaryButton` |
| FAQ | `Faq-module` | — |
| 区块包装 | `SectionWrapper-module` | — |
| 菜单开关 | `MenuToggle-module` | 含 `line`，为汉堡图标 |
| 社交图标 | `SocialIcons-module` | 含 `socialLink` |
| 文本渐显 | `AnimatedReveal-module` | 见 3.7.3 |

以上组件的具体几何与状态规则未在本轮采集范围内，仅列出构成以说明体系覆盖范围。

---

## 6. 布局与栅格

### 6.1 容器规则【实测】

```css
.container {
  max-width: var(--max-width-main);                        /* 1440px */
  width: calc(100% - 2 * var(--container-margin));
  margin-left: auto;
  margin-right: auto;
}

--container-margin: clamp(32px, 22.857px + 2.857vw, 64px);
```

**要点【归纳】**：容器宽度通过"100% 减去两侧动态外边距"实现，而非固定 padding。视口越窄，外边距越小（下限 32px）；视口越宽，外边距越大（上限 64px）。这使内容区宽度随视口连续变化，避免了断点跳变。

### 6.2 内容宽度档位【实测】

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--max-width-main` | 1440px | 页面主容器 |
| `--max-width-medium` | 1192px | 中型内容区 |
| `--max-width-small` | 960px | 窄内容区 |
| `--max-width-narrow` | 660px | 正文阅读区 |

与 3.3.4 的字符宽度令牌配合使用：容器负责控制物理宽度，字符宽度令牌负责控制最佳阅读行长。

### 6.3 默认文本色【实测】

```css
body { color: var(--theme-foreground-secondary); }
```

页面默认文字色为**二级前景色**而非一级。一级前景色（最深的 `#141413`）仅保留给标题与关键信息。这一处理使正文天然处于"次级"的视觉层级，无需在每个段落上重复声明颜色。

---

## 7. 设计原则归纳

综合上述提取结果，可将 Claude.com 的设计语言归纳为以下六条原则：

**原则一：暖色替代绝对中性色。**
背景不用纯白，暗色不用纯黑，灰阶全部带黄绿偏。整体呈纸感，规避技术冷感。

**原则二：色彩分层投放。**
彩色只出现在装饰层（插图、图标、标记），界面骨架一律中性灰，交互层仅保留一个品牌色（clay）。颜色是稀缺资源，不参与信息编码以外的装饰性表达。

**原则三：令牌三层分离。**
原始值 → 语义 → 主题作用域。组件永远只引用语义层，换肤通过切换作用域类名完成，组件代码零改动。

**原则四：字体与字号解耦。**
排版尺度定义"多大"，字体族定义"什么性格"，行高定义"多疏松"，三者正交。因此每级字号可自由搭配 sans / serif 与七档行高。

**原则五：状态反馈不动布局。**
悬停、聚焦等状态一律使用 `box-shadow` 与 `outline` 表达，绝不改变尺寸、边距或位置。所有过渡时长控制在 0.1 – 0.3s。

**原则六：动效克制。**
`transition: none` 是该站点声明频次最高的过渡值；入场位移仅 10px；阴影透明度不超过 10%。动画的作用是提示状态变化，而非制造表演。

---

## 8. 工程落地建议

### 8.1 迁移至 Tailwind v4（`@theme` 字段）

若需将本套令牌迁移至 Tailwind v4 项目，可直接映射为 `@theme inline` 声明：

```css
@import "tailwindcss";

@theme inline {
  /* 字体 */
  --font-sans:  var(--font-anthropic-sans), system-ui, sans-serif;
  --font-serif: var(--font-anthropic-serif), Georgia, serif;
  --font-mono:  var(--font-anthropic-mono), ui-monospace, monospace;

  /* 中性色阶 */
  --color-gray-000: #ffffff;
  --color-gray-050: #faf9f5;
  --color-gray-100: #f5f4ed;
  --color-gray-150: #f0eee6;
  --color-gray-200: #e8e6dc;
  --color-gray-250: #dedcd1;
  --color-gray-300: #d1cfc5;
  --color-gray-350: #c2c0b6;
  --color-gray-400: #b0aea5;
  --color-gray-450: #9c9a92;
  --color-gray-500: #87867f;
  --color-gray-550: #73726c;
  --color-gray-600: #5e5d59;
  --color-gray-650: #4d4c48;
  --color-gray-700: #3d3d3a;
  --color-gray-750: #30302e;
  --color-gray-800: #262624;
  --color-gray-850: #1f1e1d;
  --color-gray-900: #1a1918;
  --color-gray-950: #141413;
  --color-gray-1000: #000000;

  /* 品牌点缀色 */
  --color-clay: #d97757;
  --color-clay-dark: #c46849;
  --color-clay-hover: #c6613f;
  --color-oat: #e3dacc;
  --color-peach: #ebc9b7;
  --color-coral: #ebcece;
  --color-fig: #c46686;
  --color-plum: #827dbd;
  --color-heather: #cbcadb;
  --color-sky: #6a9bcc;
  --color-cactus: #bcd1ca;
  --color-mineral: #629987;
  --color-olive: #788c5d;

  /* 语义色 */
  --color-error: #bf4d43;
  --color-focus: var(--color-clay-dark);

  /* 圆角 */
  --radius-2: 2px;   --radius-4: 4px;   --radius-6: 6px;
  --radius-8: 8px;   --radius-12: 12px; --radius-16: 16px;
  --radius-24: 24px; --radius-32: 32px;
  --radius-48: 48px; --radius-64: 64px;

  /* 阴影 */
  --shadow-sm: 0 2px 8px #0000000a;
  --shadow-md: 0 4px 20px #0000000a;
  --shadow-lg: 0 4px 16px #0000001a;

  /* 缓动 */
  --ease-out-quart:    cubic-bezier(.165, .84, .44, 1);
  --ease-out-expo:     cubic-bezier(.19, 1, .22, 1);
  --ease-out-power2:   cubic-bezier(.25, 1, .5, 1);
  --ease-in-out-quart: cubic-bezier(.77, 0, .175, 1);
  --ease-in-out-expo:  cubic-bezier(1, 0, 0, 1);
}

/* 语义层 */
.theme-main {
  --background:         var(--color-gray-050);
  --foreground:         var(--color-gray-950);
  --muted-foreground:   var(--color-gray-600);
  --border:             var(--color-gray-300);
  --primary:            var(--color-gray-950);
  --primary-foreground: var(--color-gray-050);
  --ring:               var(--color-clay-dark);
}

.theme-dark {
  --background:         var(--color-gray-950);
  --foreground:         var(--color-gray-050);
  --muted-foreground:   var(--color-gray-400);
  --border:             var(--color-gray-700);
  --primary:            var(--color-gray-050);
  --primary-foreground: var(--color-gray-950);
  --ring:               var(--color-clay-dark);
}
```

### 8.2 可复用 CSS 片段：按钮

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  line-height: 1;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-8);
  font-family: var(--font-sans);
  font-feature-settings: "pnum" on, "lnum" on, "liga" on;
  transition: color .1s ease-in-out,
              background-color .2s ease-in-out,
              border-color .2s ease-in-out,
              box-shadow .2s ease-in-out;
}

/* 尺寸 */
.btn--sm { height: 28px; padding: 4px 12px;  gap: 4px; font-size: 13px; }
.btn--md { height: 36px; padding: 8px 12px;  gap: 8px; font-size: 14px; }
.btn--lg { height: 40px; padding: 8px 16px;  gap: 8px; font-size: 15px; }

/* 变体：以 primary 为例 */
.btn--primary {
  background-color: var(--primary);
  color: var(--primary-foreground);
  box-shadow: 0 0 0 0 var(--primary);
  font-weight: 480;
}
.btn--primary:hover:not(:disabled) {
  box-shadow: 0 0 0 2px var(--primary);
}

/* 状态 */
.btn:focus-visible { outline: 2px solid var(--ring); outline-offset: 4px; }
.btn:disabled      { opacity: .5; cursor: not-allowed; }
```

> **注意**：`font-weight: 480` 需要字体支持可变字重轴或具备对应静态字重文件，否则浏览器会就近取整。若使用不支持 480 的字体，建议回退至 500。

### 8.3 落地检查清单

- [ ] 页面底色替换为 `#faf9f5`，暗色底替换为 `#141413`
- [ ] 灰阶整体替换为暖灰（带黄绿偏）
- [ ] 引入 `size-adjust` 校准的字体回退族，消除字体加载抖动
- [ ] 排版尺度改为 `clamp()` 流体声明，并为每级提供 serif 变体
- [ ] 行高抽为独立令牌，与字号解耦
- [ ] 按钮悬停改为外扩 ring，取消位移与背景变色
- [ ] 焦点环路使用品牌色，`outline-offset: 4px`
- [ ] 主动审查并关闭不必要的 `transition`
- [ ] 令牌按"原始 / 语义 / 主题"三层组织，组件只引用语义层

---

## 9. 局限性与后续工作

**本次提取的边界：**

1. 组件层仅按钮具备完整规则，其余组件（下拉、卡片、导航、页脚等）仅还原了构成与命名，未采集几何与状态细节。
2. 响应式断点仅提取到容器与边距的流体规则，未完整还原全部 `@media` 查询阈值。
3. 页面实际渲染效果未经视觉比对验证（站点在浏览器环境中会重定向至登录页）。
4. `--font-anthropic-*` 系列在非拉丁语系场景（如日文、韩文）下存在额外的字体覆盖声明（`Noto Sans JP` / `Noto Sans KR`），本报告未展开。
5. 交互组件的可访问性属性（ARIA、键盘导航顺序）未纳入本次采集范围。

**建议的后续工作：**

- 若需完整组件库，建议以登录后的应用界面（claude.ai）为对象做补充采集
- 对 480 字重的实际渲染表现做视觉比对，验证其在本项目字体下的可行性
- 补充深色主题的独立调校与否的进一步验证

---

## 附录 A：完整色彩清单

```
中性色阶（21 级）
#ffffff  #faf9f5  #f5f4ed  #f0eee6  #e8e6dc  #dedcd1  #d1cfc5
#c2c0b6  #b0aea5  #9c9a92  #87867f  #73726c  #5e5d59  #4d4c48
#3d3d3a  #30302e  #262624  #1f1e1d  #1a1918  #141413  #000000

品牌点缀色（13 色）
#d97757  #c46849  #c6613f  #e3dacc  #ebc9b7  #ebcece  #c46686
#827dbd  #cbcadb  #6a9bcc  #bcd1ca  #629987  #788c5d

语义色
#bf4d43（error）   #c46849（focus）
```

## 附录 B：关键令牌速查

| 类别 | 令牌前缀 | 档位数 |
| --- | --- | --- |
| 颜色 | `--color-*` | 35 |
| 语义 | `--theme-*` | 40+ |
| 字体 | `--font-*` | 4 |
| 字重 | `--font-weight-*` | 5（+480 裸值） |
| 字号 | `--display-*` / `--headline-*` / `--body-*` / `--caption` | 14 |
| 行高 | `--line-height-*` | 7 |
| 可读宽度 | `--text-width-*` | 6 |
| 间距 | `--sp-*` | 17 |
| 圆角 | `--br-*` | 10 |
| 阴影 | `--shadow-*` | 3 |
| 缓动 | `--ease-*` | 8 |
| 容器 | `--max-width-*` | 4 |
| 容器边距 | `--container-margin` | 1 |

---

*本报告所有标注为【实测】的数据均直接取自站点样式表原始声明，可按附录 A 与 B 直接复用。标注为【归纳】与【推断】的内容为分析结论，落地前建议结合目标项目实际验证。*
