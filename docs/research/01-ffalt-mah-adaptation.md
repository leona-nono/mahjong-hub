# 01 · ffalt/mah 研究与接入记录

## 结论

本项目没有复制 `ffalt/mah` 的源码。现有 `components/games/MahjongSolitaire.tsx` 与
`lib/mahjong-solitaire/` 是自研实现，但已经覆盖了该项目最适合借鉴的核心玩法：
可解牌局生成、固定布局、提示、撤销、洗牌和本地前端运行。

参考项目：<https://github.com/ffalt/mah>

## 对照结果

| ffalt/mah 能力 | 本站现状 | 本阶段决定 |
| --- | --- | --- |
| Mahjong Solitaire 网页玩法 | 已有 `MahjongSolitaire` | 保留自研实现，不复制源码 |
| 多种固定布局 | 已有 turtle / pyramid | 后续再扩展布局数据 |
| 可重复牌局 | `createBoard({ seed })` 已支持 | 作为牌局分享和回放的基础 |
| 提示、撤销、洗牌 | 已有 solver / history | 保留并继续补齐交互测试 |
| 多语言和主题 | 站点已有 next-intl / 主题样式 | 由站点统一维护 |

## 许可证记录

`ffalt/mah` 标注为 MIT，但其 README 同时对图片、音效、字体等资源分别致谢。
因此本仓库只借鉴公开玩法和产品能力，不引入其素材；如未来引用代码或资源，必须在
`THIRD_PARTY_NOTICES.md` 中保留对应声明并逐项核对资源许可。

## 验收标准

- 固定 seed 生成的同一布局结果一致。
- turtle / pyramid 牌局可完成清除。
- 暂停、提示、撤销、洗牌不破坏牌局状态。
- 现有 Next.js 构建和 Vitest 测试保持通过。

## 后续可迭代

1. 增加分享 URL：`?layout=turtle&seed=...`。
2. 增加牌局回放记录和每日牌局。
3. 增加更多布局数据，而不是复制第三方布局实现。
4. 将牌局种子、布局和成绩写入用户历史记录。
