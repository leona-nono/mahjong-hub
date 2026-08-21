# 麻将消除 · 难度调节器设计（v0.2 · 纯关卡 + 难度段轮换 · 已落地引擎）

> 配套 `mahjong-solitaire-design.md` §4.3（难度度量防右偏悬崖 A1）的实现件。
> **状态：引擎已落地**（`lib/game/solitaire/difficulty.ts` + `deck.ts` alphabet 选项 + 单测）。
> v0.2 关键变化（用户决策）：**去掉章节/Episode，难度纯按关卡；每 3-5 关切成一段，段内平滑爬坡、段界重置喘息、段末峰值轮换**。
> 全部数值（字母表→手感映射、段长/峰值序列、每日挑战难度）仍待 playtest 校准 [PLACEHOLDER]。

---

## 1. 设计目标

消除玩法的难度必须**平滑、可量化、可回放验证**，核心是化解 **A1 风险（难度右偏悬崖）**——前期过易、某关突然暴难导致流失。v0.2 不再用"章节"组织，整个闯关是**纯关卡序列 1,2,3,…**，并满足：

1. 关卡切成「难度段」，每段 **3-5 关**；
2. **段内**字母表从 12 平滑爬到该段峰值（难度缓升，无陡崖）；
3. **段界**字母表重置回 12（喘息/轮换），不再无限单调爬坡；
4. **段长**与**段末峰值**按周期轮换 → 每 3-5 关曲线形状/峰值自动调整；
5. 每关 100% 可解（复用逆推生成器保证）；
6. 难度可被客观指标度量，而非靠手感拍脑门。

> 防悬崖的真实保证在**受控变量（字母表，smoothstep + 小 delta，确定性）**，不在噪声较大的实测 `avgBranch`（见 §2 注）。

---

## 2. 两个关键实测发现（决定设计走向）

落地前用探针实测了 TURTLE_144，结论颠覆了最初假设：

| 发现 | 实测 | 影响 |
|------|------|------|
| **① `minBranch` 被逆推法锁死为 1** | 30+ 种子 `minBranch` 恒为 1 | `minBranch` **不能**作难度轴（原"按 minBranch 分带"不可行） |
| **② `avgBranch` 是噪声代理** | 同字母表跨种子方差 ±~1.6；且偶尔出现"字母表↑但 avgBranch↑"的噪声反转 | 实测 `avgBranch` **不可作硬单调约束**，只能作软平滑；曲线单调靠字母表 |
| **③ `measureDifficulty` 很慢** | turtle 约 **250ms/局** | 运行时**不能在线采种子**；必须离线预生成种子目录 |

**结论**：难度主轴是**牌面字母表大小（不同牌型数）**——逆推法下唯一可控旋钮；实测 `avgBranch` 仅作软平滑与监控参考。

---

## 3. 真实难度轴

### 主轴：字母表大小 `alphabet`（不同牌型数）
`deck.buildPairPool({alphabet})` 取 K 种不同牌型并均匀重复填满 72 对：

- 字母表小 → 同型牌多 → 任意时刻可配对数多 → **简单**
- 字母表大（=36 满库）→ 牌型分散 → 可配对数少 → **难**

**实测（TURTLE_144，每档均值）：**

| alphabet | avgBranch 均值 | 难度定位 |
|---|---|---|
| 12 | 17.5 | 段起点（最易，牌面重复度高） |
| 18 | 15.3 | 中前 |
| 24 | 14.2 | 中后 |
| 36（满库） | 13.9 | 段峰值上限（最难） |

### 副轴：布局 `layout`
- `PYRAMID`（80 张）比 `TURTLE_144`（144 张）更短 → 自然更轻，作**教学/休闲**选项。
- **v0.2 默认整局恒定 `turtle144`**（去掉按章切换布局），保证体验一致。

### 微调：种子 `seed`
同字母表下换种子可在窗口内 ±~1.5 浮动 `avgBranch`，用于同难度段内的局间差异（防背板）。

---

## 4. 难度段（替代旧"难度带/章节"）

v0.2 没有 easy/normal/hard 章节带，而是把关卡切成**难度段**，每段由「段长 + 段末峰值」刻画：

```ts
const DEFAULT_SEG_LENS: number[]  = [5, 4, 3];     // 段长轮换：5/4/3 关（落在 3-5）
const DEFAULT_SEG_PEAKS: number[] = [22, 28, 34];   // 段末峰值字母表轮换（易/中/难）
const ALPHA_EASY = 12;                              // 每段起点字母表
```

`levelInfo(level)` 把关卡映射为：

| 字段 | 含义 |
|------|------|
| `segment` | 0-based 难度段序号 |
| `posInSegment` / `segmentLen` | 段内位置 / 本段关数 |
| `segmentPeak` | 本段末峰值字母表（取自 `SEG_PEAKS` 周期） |
| `t` | 段内归一化进度 0..1 |
| `alphabet` | `round(12 + (peak-12)*smoothstep(t))` → 段内平滑爬坡 |
| `band` | 段内位置标签：`ease`(段首) / `ramp`(段中) / `peak`(段末) |

**曲线形态（默认序列）：**
- 段0（lv1-5，长5）：字母表 12 → 22
- 段1（lv6-9，长4）：字母表 12 → 28（段界重置喘息，峰值更高）
- 段2（lv10-12，长3）：字母表 12 → 34
- 段3（lv13-17，长5）：字母表 12 → 22（段长与峰值同时轮换）

→ **每 3-5 关曲线自动调整轮换**：段越长节奏越缓、段末峰值越高越硬核，段界统一回落给休闲玩家喘息。

---

## 5. 平滑与防悬崖（落地点）

- **段内受控单调**：`alphabet` 由 `smoothstep(t)` 生成，段内严格不降、相邻关 delta 小（≤~4 在 5 关段内分摊）→ 杜绝陡升（A1 的硬保证，确定性）。
- **软平滑（实测 avgBranch）**：`buildSeedCatalog` 在采集候选时优先选「≤ 上关实测难度」中最大者，尽量压平种子噪声；但这是**软约束**，轴噪声反转时不强行牺牲可解性。
- **段界喘息**：`buildSeedCatalog` 在每个新段把 `prevAvg` 重置为 `Infinity`，**允许难度回落**（这是设计意图，不是违约）。

> 单测已固化：段长落在 3-5；段内字母表不降、段界重置为 12；`band` 反映段内位置；`buildSeedCatalog` 每关可解 + 字母表曲线平滑 + 段界重置。

---

## 6. 运行时架构：离线种子目录

因 `measureDifficulty` 250ms/局，**绝不在玩家设备上实时度量挑种子**。架构分两层：

1. **离线预生成**（构建/后台任务）：`buildSeedCatalog(totalLevels)` 跑一遍，产出每关一个 `{level, seed, alphabet, layout, avgBranch, band, segment}` 清单，序列化为 JSON 下发。一次性、可并行、可缓存。
2. **运行时 O(1) 取关**：`pickLevel(catalog, level, rotateSeed)` 直接按关卡取种子（或按日期哈希 `rotateSeed` 做每日挑战轮换），客户端用该 seed 调 `generateSolvable` 即可——**零度量、零延迟**。

种子目录同时是**防刷与公平**一环：服务器持种子，客户端只拿 seed 渲染，无法篡改难度（呼应主文档"服务端权威"）。

---

## 7. 与监控/道具的联动

- **A1 悬崖监测**：线上埋点"关卡失败率/放弃率"。若第 N 关失败率相对 N-1 突增 >阈值（悬崖信号），**回调曲线参数**（调缓该段 `segmentPeak` 或加长段），而非让玩家靠道具硬过——难度纪律（见道具方案 §12）。
- **道具健康指标 I1–I6**：若某关"解围道具使用率"异常高，先怀疑该关难度超出曲线预期，回查目录 `avgBranch`，必要时重生成该关种子。
- **每日挑战**：用独立 seed 轮换 + 固定较高字母表（如 30，硬核向），不计入主线难度段曲线。

---

## 8. 引擎接口速查

```ts
// deck.ts
buildPairPool(opts?: { alphabet?: number }): PairEntry[]   // 字母表<36 时截断并重复填满 72 对

// generator.ts
generateSolvable(template, seed, opts?: { alphabet?: number; maxRetries?: number }): GeneratedBoard | null

// difficulty.ts（v0.2）
levelInfo(level, segLens?, segPeaks?): LevelInfo          // 关卡→难度段/字母表/位置（纯函数）
targetWindowForAlphabet(alpha): [number, number]          // 字母表→avgBranch 接受窗口
generateByDifficultyBand(template, {alphabet,targetAvg}, seedBase?, budget?, maxRetries?): GeneratedBoard | null
buildSeedCatalog(totalLevels=60, seedBase=1, perLevelBudget=80, template=TURTLE_144): CatalogEntry[]  // 离线预生成
pickLevel(catalog, level, rotateSeed=0): CatalogEntry | null
```

---

## 9. 测试覆盖（难度相关 10 项，已绿；引擎总 34 项）

- 字母表是真实难度轴（alphabet12 > alphabet36 avgBranch；满库牌组自检；字母表12池=72对）
- 纯关卡 + 段轮换（段长落在 3-5；段内字母表不降、段界重置为 12；band 反映段内位置）
- 按带采样（命中窗口返回可解局；透传 alphabet 仍回放可解；不可达窗口返回 null；`buildSeedCatalog` 每关可解 + 字母表曲线平滑 + 段界重置）

---

## 10. 待 playtest 校准 [PLACEHOLDER]

- 字母表→手感映射：12/18/24/36 是"客观难度"，**玩家体感**需实测；可能要在 14/16/20/28 等处加档。
- **难度段参数**：段长序列 `[5,4,3]` 与峰值序列 `[22,28,34]` 是否合适（更硬核可拉高峰值至 30/34/36；更休闲可整体下移）。
- 每日挑战字母表与轮换粒度（按日/按周）。
- 银发用户（55+）对"字母表小=牌面重复易认"是否真更友好——可用性测试验证（呼应牌面美术规范）。
