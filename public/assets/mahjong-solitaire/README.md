# Mahjong Solitaire · Tile Art

银发向 Shanghai 消除专用牌面。**本目录与 `mahjong-hongkong/`（四人桌传统牌）隔离**，避免两套规范互相覆盖。

## 命名规范（定死，换图只换文件内容）

路径：`public/assets/mahjong-solitaire/tiles/{name}.svg`（或同名 `.webp` / `.png`）

| 类别 | 文件名 | 对应牌 ID | 规范 |
|------|--------|-----------|------|
| 万子 | `man-01` … `man-09` | `m1`–`m9` | **只显示阿拉伯数字，禁止「万/萬」**；数字约占牌面 1/3 |
| 筒子 | `pin-01` … `pin-09` | `p1`–`p9` | 加大圆点图案；高对比 |
| 条子 | `sou-01` … `sou-09` | `s1`–`s9` | 加大竹竿图案 |
| 风 | `wind-e` `wind-s` `wind-w` `wind-n` | `z1`–`z4` | 英文角标 E/S/W/N + 可选简化汉字 |
| 箭 | `dragon-white` `dragon-green` `dragon-red` | `z5`–`z7` | 白/发/中；色盲需角标字母 W/G/R |
| 四季 | `season-spring` … `season-winter` | `f1`–`f4` | 组内任意互配 |
| 四君子 | `flower-plum` `flower-orchid` `flower-bamboo` `flower-chrys` | `f5`–`f8` | 组内任意互配 |
| 生肖（特殊替换用） | `zodiac-rat` … `zodiac-pig` | 映射表另定 | P0 差异化弹药 |
| 脸谱（特殊替换用） | `face-01` … `face-04` | 映射表另定 | 同上 |
| 牌背 | `../backs/default.svg` | — | 默认牌背 |

色盲：图案 + 角标双编码，**不单靠颜色**。

## 占位资源

`tiles/*.svg` 为程序生成的占位图，保证玩法可开发。正式美术按同名覆盖即可，**无需改代码**（`lib/mahjong-solitaire/art.ts` 按上表解析路径）。

生成命令：

```bash
node scripts/generate-solitaire-tile-placeholders.mjs
```
