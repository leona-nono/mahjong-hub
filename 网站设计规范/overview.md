# 麻将 H5 IAA 项目 · 总览（v0.6 · 消除独立闭环 + 双获客 + 联盟电商）

## 文档矩阵
- `mahjong-iaa-design.md` **v0.6**：宏观定位「文化出海 + 服务明确的麻将需求人群」；消除独立可闭环；获客 = SEO（长尾+小众语种）+ YouTube/TikTok 短视频买量并行；变现 = IAA + $4.99 去广告 IAP + 亚马逊联盟（Shopify 待规模）；H5 粘性缓解（PWA/Web Push/每日 streak）。
- `mahjong-solitaire-design.md` **v0.5**：消除玩法设计方案 + 开发清单（Shanghai 配对消除）；已吸收难度平滑曲线/Undo 免费/无障碍 P0/streak 冻结/看广告解锁牌背/内容→游戏奖励/cohort 广告/埋点健康指标；消除内积分自洽。
- `mahjong-solitaire-items.md` **v0.1**：道具玩法方案（独立可执行）。继承 §6 并修正关键歧义：**解围 = 死局态下的定向可解洗牌**，引擎只实现 `shuffleSolvable` 一个原语、UI 分两入口；补全库存模型（item_ledger append-only）、6 类获取渠道（含签到/任务/转盘）、消耗漏斗、死局解围点位、道具健康指标 I1–I6、防滥用；**并补 §14 外部游戏参考活检**：4 类样本（麻同类 Microsoft Mahjong 三件套 / 三消 Candy Crush 三档触发 / 家装 Homescapes / 中文休闲 碰碰糖果·梦幻消消乐）验证 4 道具模型为行业标配，采纳触发时机档 + 按进度解锁 + 免费福利矩阵 + 库存 caps，明确不抄单格锤 / 棋盘合成 Power-up / 步数道具 / 订阅无限道具（机制不兼容）。
- `mahjong-solitaire-difficulty.md` **v0.2**：难度调节器设计（**引擎已落地**）。**v0.2 去章节**：难度纯按关卡，每 3-5 关切「难度段」。实测颠覆原假设——`minBranch` 被逆推法锁死为 1（不可作难度轴）、`avgBranch` 是噪声代理（±1.6 且偶尔轴反转，不可作硬单调约束）、`measureDifficulty` 250ms/局（运行时不能在线采种子）；真实难度主轴 = **字母表大小 alphabet**（实测 avgBranch：12→17.5 / 18→15.3 / 24→14.2 / 36→13.9）；**难度段** `levelInfo`（段长轮换 `[5,4,3]`、段末峰值轮换 `[22,28,34]`、段内 smoothstep 爬坡、段界重置喘息、band=ease/ramp/peak）；防悬崖硬保证在受控字母表（确定性），实测 avgBranch 仅作软平滑；**离线种子目录架构**（`buildSeedCatalog` 服务端预生成、运行时 O(1) `pickLevel`）；联 A1 悬崖监测与道具 I1–I6。引擎：`deck.buildPairPool({alphabet})` + `generator.generateSolvable({alphabet})` + `difficulty.ts`(levelInfo/targetWindowForAlphabet/generateByDifficultyBand/buildSeedCatalog/pickLevel)，难度单测 10 项全绿（**总 34 绿**）。
- `mahjong-prototype-tasks.md` v0.3（Phase 1 标注"双游戏打通降级为可选项"）；**新增 `## Task 6 · 可玩浏览器原型` 正式条目**：纯前端 Next demo（渲染 TURTLE_144 + 点选消除 + 死局检测），复用 E6 引擎，Out of scope 标清后端/广告/道具库存，验收标准 5 条，依赖顺序 E6✅→建议同 Sprint 补 E7/E8。
- `mahjong-design-review.md`：策划视角坦诚评审（方向/内容/变现三维）。

## 站点北极星定位（用户拍板，v0.6）
**宏观使命**：以「文化出海」为品牌叙事、服务「明确的麻将需求人群」（海外华人 + 西方麻将好奇者 + 银发休闲族）。
**架构决策**：休闲消除 = **独立可闭环**第一支柱（流量→留存→广告变现全链路自洽）；AI 麻将 = 可选增量（数据证明确需才叠加，非生死线）。
**获客双通道**：SEO 长尾 + 小众语种 cornerstone 文章（长期地基）｜ YouTube/TikTok 短视频买量（并行加速，守 LTV>CAC）。
**变现**：激励广告（绑工具）+ $4.99 去广告 IAP + **亚马逊联盟**（零边际成本电商副变现）｜ Shopify 自营待月 UV 达量级再开。

## 竞品活检核心结论
| 抄（采纳） | 不抄（规避） |
|-----------|--------------|
| Vita「万」字省略牌面 + 首日零广告 | Vita 的广告过频（正因此流失银发） |
| Blast 三工具标配（提示/撤销/洗牌）+ 无压力节奏 | Journey $19.99/月订阅（品类反面教材） |
| Daily 借 "Mahjong" 品牌词 + 赛季收藏 | 情报的"主推二维滑动"——改为 P2 变体页（"mahjong connect" 另一组关键词，非替换堆叠） |
| Journey 收藏/图鉴思路（轻量赛季限定） | ~~Journey 旅行章节 × 博客联动~~（v0.3 已砍，保持轻量） |
| — | 电商导流（联名牌背↔实物）：P3 实验，非支柱 |

## 牌面美术规范（银发向，直接可执行）
万字省略（只留阿拉伯数字）· 数字占牌面 1/3 · 12 生肖 + 4 脸谱特殊牌 · 高对比柔和色 · 点选优先无拖拽 · 背景随赛季/节日活动变化（不做游戏内旅行章节）。

## 变现结构（v0.5）
激励广告只绑工具（提示/洗牌/撤销/解围）+ $4.99 一次性去广告 IAP（Stripe/Paddle，避开商店税）+ 积分商城（外观 sink）+ 赛季收藏。广告只给 meta 层与消除道具，**绝不卖对战牌运**。

## 待验证
全部数值 [PLACEHOLDER] 待 playtest。落地路线 P0（牌面+银发+首日零广告+PWA/Web Push，30 天）→ P1（IAP+赛季+亚马逊联盟挂链，60 天）→ P2（短视频买量扩量 + connect 变体页 + i18n 长尾，90 天）→ P3（Shopify 自营，待月 UV 量级）。
