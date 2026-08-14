# Mahjong Solitaire · Tile Art

银发向 Shanghai 消除专用牌面。**本目录与 `mahjong-hongkong/`（四人桌传统牌）隔离**，避免两套规范互相覆盖。

## 命名规范（定死，换图只换文件内容）

路径：`public/assets/mahjong-solitaire/tiles/{name}.png` 或同名 `.svg`

| 类别 | 文件名 | 对应牌 ID | 规范 |
|------|--------|-----------|------|
| 万子 | `man-01` … `man-09` | `m1`–`m9` | 目标：阿拉伯数字、禁止「万/萬」；当前为 Mahjong-set 实物图 |
| 筒子 | `pin-01` … `pin-09` | `p1`–`p9` | 加大圆点图案；高对比 |
| 条子 | `sou-01` … `sou-09` | `s1`–`s9` | 加大竹竿图案 |
| 风 | `wind-e` `wind-s` `wind-w` `wind-n` | `z1`–`z4` | 东/南/西/北 |
| 箭 | `dragon-white` `dragon-green` `dragon-red` | `z5`–`z7` | 白/发/中 |
| 四季 | `season-spring` … `season-winter` | `f1`–`f4` | 组内任意互配；套装未含，暂用 SVG 占位 |
| 四君子 | `flower-plum` `flower-orchid` `flower-bamboo` `flower-chrys` | `f5`–`f8` | 组内任意互配；套装未含，暂用 SVG 占位 |
| 生肖 | `zodiac-rat` … `zodiac-pig` | 映射表另定 | P0 差异化弹药 |
| 脸谱 | `face-01` … `face-04` | 映射表另定 | 同上 |
| 牌背 | `../backs/default.svg` | — | 套装未含独立牌背 |

## 来源映射（Mahjong-set `001.png`–`034.png`）

| 编号 | 文件 |
|------|------|
| 001–009 | `man-01`–`man-09` |
| 010–018 | `pin-01`–`pin-09` |
| 019–027 | `sou-01`–`sou-09` |
| 028–031 | `wind-e` `wind-s` `wind-w` `wind-n` |
| 032–034 | `dragon-red` `dragon-green` `dragon-white` |

换正式图仍按同名覆盖，代码按 `artKeyForTile` 解析路径。
