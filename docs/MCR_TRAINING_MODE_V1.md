# 中国国标麻将（MCR）训练赛模式 v1

## 已确认的产品基线

- 四人、144 张：108 张数牌、28 张字牌、8 张花季牌。
- 花季牌摸到即公开，放入个人花牌区，并从牌墙尾部补牌；花季牌不进入手牌拆解。
- 和牌牌形：四副面子一对将，或七对、十三幺等认可特殊牌形。
- 必须先满足 **8 分起和**；花季牌每张 1 分，但不计入 8 分门槛。
- 结算产品约定：自摸由其余三家各支付，放铳由放铳者支付；四人累计分数。

## 开发阶段

1. **规则底座（进行中）**：144 张牌墙、花季补牌、牌墙尾部补牌、8 分门槛与可测试状态。
2. **MCR 计分表（下一阶段）**：将 81 项计分元素写为独立、可测的规则数据，并处理不重复计分与排除关系。
3. **对局流程**：吃、碰、明杠、暗杠、补杠与抢杠胡、荒牌和局、座风/圈风与累计分。
4. **产品桌面**：国标专属桌面、公开花牌区、可解释计分单、移动端横竖屏自适应、普通话播报。

在第 2 阶段完成前，页面必须标为“训练赛开发中”，不得声称为完整的 81 番比赛计分器。

## 规则来源

- European Mahjong Association / World Mahjong Organization，《Mahjong Competition Rules》：
  <https://mahjong-europe.org/portal/images/docs/mcr_EN.pdf>
- EMA 的 MCR 规则入口：
  <https://mahjong-europe.org/portal/index.php?Itemid=167&id=31&option=com_content&view=article>

参考站点仅用于清洁观察玩法范围，不复制其源码、美术或文案：
<https://mahjongo.com/chinese>
