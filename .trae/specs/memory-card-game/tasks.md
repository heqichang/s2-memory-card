# 记忆卡片翻转游戏 - 实现计划

## [x] Task 1: 创建项目基础结构和 HTML 页面
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建 index.html 作为游戏主页面
  - 构建页面基础结构：标题栏、信息区（倒计时、已配对数）、卡片网格区、控制按钮区
  - 添加游戏结果弹窗容器
- **Acceptance Criteria Addressed**: AC-1, AC-10
- **Test Requirements**:
  - `programmatic` TR-1.1: HTML 页面包含 16 张卡片元素的容器
  - `programmatic` TR-1.2: 页面包含倒计时显示元素
  - `programmatic` TR-1.3: 页面包含已配对数显示元素
  - `programmatic` TR-1.4: 页面包含重新开始按钮
  - `human-judgement` TR-1.5: 页面布局居中，结构清晰
- **Notes**: 使用语义化 HTML 标签

## [x] Task 2: 实现卡片样式和翻转动画
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 使用 CSS 3D transform 实现卡片翻转效果
  - 设计卡片正面和背面样式
  - 实现卡片网格布局（4x4）
  - 添加卡片悬停和点击反馈效果
- **Acceptance Criteria Addressed**: AC-2, AC-10
- **Test Requirements**:
  - `programmatic` TR-2.1: 卡片具有 front 和 back 两面
  - `programmatic` TR-2.2: 添加 flipped 类名后卡片呈现翻转状态
  - `human-judgement` TR-2.3: 翻转动画流畅自然，过渡时间约 0.3s
  - `human-judgement` TR-2.4: 卡片网格排列整齐，间距均匀
- **Notes**: 使用 CSS perspective 和 transform-style: preserve-3d 实现 3D 翻转

## [x] Task 3: 实现游戏核心逻辑 - 卡片翻转与配对
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 生成随机卡片图案数据（8 对 emoji）
  - 实现卡片点击事件处理
  - 管理已翻开卡片状态（最多同时 2 张）
  - 实现配对判断逻辑
  - 配对成功保持翻开，配对失败延迟翻回
  - 已配对卡片不可再次点击
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-3.1: 游戏初始化时 16 张卡片随机排列，包含 8 对相同图案
  - `programmatic` TR-3.2: 点击卡片添加 flipped 类，显示正面
  - `programmatic` TR-3.3: 同时只能有 2 张卡片处于翻开未配对状态
  - `programmatic` TR-3.4: 两张图案相同的卡片翻开后保持 flipped 状态
  - `programmatic` TR-3.5: 两张图案不同的卡片翻开后约 1 秒自动移除 flipped 类
  - `programmatic` TR-3.6: 已配对成功的卡片点击无反应
- **Notes**: 使用 data 属性存储卡片配对标识

## [x] Task 4: 实现倒计时系统
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现倒计时计时器（默认 60 秒）
  - 实时更新倒计时显示
  - 倒计时归零时触发游戏结束逻辑
  - 游戏胜利时停止倒计时
- **Acceptance Criteria Addressed**: AC-6, AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-4.1: 游戏开始时倒计时显示 60 秒
  - `programmatic` TR-4.2: 倒计时每秒递减 1
  - `programmatic` TR-4.3: 倒计时归 0 时触发游戏失败状态
  - `programmatic` TR-4.4: 全部配对成功后倒计时停止
- **Notes**: 使用 setInterval 实现，注意清除定时器避免内存泄漏

## [x] Task 5: 实现游戏状态管理和结果展示
- **Priority**: P0
- **Depends On**: Task 3, Task 4
- **Description**: 
  - 管理游戏状态：进行中、胜利、失败
  - 实时更新已配对数显示
  - 实现游戏胜利/失败弹窗提示
  - 游戏结束后禁用卡片点击
  - 实现重新开始功能
- **Acceptance Criteria Addressed**: AC-7, AC-8, AC-9
- **Test Requirements**:
  - `programmatic` TR-5.1: 已配对成功一对后，配对数显示 +1
  - `programmatic` TR-5.2: 全部配对成功（8 对）后显示胜利弹窗
  - `programmatic` TR-5.3: 倒计时结束且未全部配对时显示失败弹窗
  - `programmatic` TR-5.4: 游戏结束后点击卡片无反应
  - `programmatic` TR-5.5: 点击重新开始按钮后，卡片重新洗牌，所有状态重置
- **Notes**: 胜利/失败状态通过 CSS 类控制弹窗显示

## [x] Task 6: 整体样式优化和视觉美化
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 优化整体配色方案
  - 添加页面背景效果
  - 优化按钮样式和交互反馈
  - 优化弹窗样式
  - 确保视觉效果统一美观
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `human-judgement` TR-6.1: 整体界面美观，配色协调
  - `human-judgement` TR-6.2: 按钮有明显的悬停和点击反馈
  - `human-judgement` TR-6.3: 弹窗样式美观，信息清晰
- **Notes**: 保持简洁现代的设计风格

## [x] Task 7: 代码优化和边界情况处理
- **Priority**: P1
- **Depends On**: Task 6
- **Description**: 
  - 代码结构优化，逻辑清晰
  - 处理快速点击等边界情况
  - 防止重复点击同一卡片
  - 添加注释说明核心逻辑
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-7.1: 快速连续点击多张卡片不会导致状态异常
  - `programmatic` TR-7.2: 点击已翻开的卡片不会触发重复逻辑
  - `human-judgement` TR-7.3: 代码结构清晰，变量命名合理
- **Notes**: 添加防抖或状态锁防止并发操作
