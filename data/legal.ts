import { privacyEmail } from '@/lib/ads-inventory';

export const LEGAL_UPDATED = '2026-11-10';

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDoc = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

const EMAIL = privacyEmail();

const privacyEn: LegalDoc = {
  title: 'Privacy Policy',
  intro:
    'This policy explains how Mahjong Hub (mahjonggame.org) handles personal data. The site is a free browser game. There is no real-money gambling, points cannot be cashed out, and four-player tables are you versus computer opponents — not other people.',
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [
        `Mahjong Hub is operated at mahjonggame.org. For privacy requests email ${EMAIL}. We do not have a separate in-game messaging channel for legal notices.`
      ]
    },
    {
      heading: 'What we collect',
      paragraphs: [
        'If you play as a guest we store progress, item counts and settings on your device (local storage). We do not require an account to play.',
        'If you sign in we receive the name, email and avatar your Google, Facebook, X or email provider shares with us, plus a session cookie so you stay signed in. We store points, item inventory, daily-challenge streak and solitaire progress on our database (hosted by Neon Postgres).',
        'Our host (Vercel) and, if you consent, Google Analytics 4 may process IP address, browser type, language, approximate region and pages you open. We do not try to identify you from that traffic data.',
        'We do not collect payment card numbers. We do not run a shop checkout on this site yet.'
      ]
    },
    {
      heading: 'Why we use data (GDPR legal bases)',
      paragraphs: [
        'Providing the game and account: contract / legitimate interest — so you can play, keep a streak, and restore progress on another device.',
        'Security and abuse prevention: legitimate interest — rate limits, login sessions, and append-only point ledgers.',
        'Analytics cookies and similar identifiers: consent. They stay off until you accept them in the cookie banner.',
        'Advertising cookies and rewarded-video identifiers: consent. No advertising SDK is loaded until you opt in and an ad network is actually connected.',
        'Legal requests: legal obligation if we must respond to a lawful demand.'
      ]
    },
    {
      heading: 'Cookies and similar storage',
      paragraphs: [
        'Necessary: sign-in session, cookie-consent choice, accessibility settings, add-to-home-screen dismiss, and guest solitaire progress. The site cannot remember your privacy choice or keep you signed in without these.',
        'Analytics: Google Analytics 4 (measurement ID) only after you opt in.',
        'Advertising: none today. If we add a rewarded-video network later, it will use the Advertising category and will not run on a rejected choice.',
        'Details and a way to change your mind are on the Cookie Policy page.'
      ]
    },
    {
      heading: 'California and similar US state laws (CCPA/CPRA)',
      paragraphs: [
        'We do not sell personal information for money. Analytics and future ads can count as “sharing” for cross-context advertising. You can refuse that sharing with Reject non-essential, the Cookie settings link, or a Global Privacy Control (GPC) signal in your browser.',
        'You may request access or deletion of account data by emailing us from the address on the account. We will not discriminate against you for exercising these rights.'
      ]
    },
    {
      heading: 'Your GDPR rights',
      paragraphs: [
        'If EU/UK/EEA law applies you may request access, correction, deletion, restriction, portability, and objection to legitimate-interest processing, and you may withdraw consent at any time without affecting play of the game.',
        'You may complain to your local data protection authority. We would rather fix the issue first — write to us at the address above.'
      ]
    },
    {
      heading: 'Children',
      paragraphs: [
        'Mahjong Hub is a general-audience game and is not directed at children under 13 (or under 16 where that is the digital-consent age). We do not knowingly collect data from children. If you believe a child created an account, email us and we will delete it.'
      ]
    },
    {
      heading: 'Processors and international transfers',
      paragraphs: [
        'Vercel hosts the website. Neon hosts the database. Auth.js talks to Google, Facebook, X or your email provider when you choose that sign-in method. Google Analytics runs only with consent.',
        'These providers may process data in the United States or other countries. Where GDPR applies we rely on their published transfer tools (such as Standard Contractual Clauses).'
      ]
    },
    {
      heading: 'Retention',
      paragraphs: [
        'Guest device data lasts until you clear site data. Account records last while the account exists. Sessions expire. Point and item ledgers are kept to prevent cheating and restore balances. You can ask us to delete an account; we will drop personal identifiers and may keep aggregated, non-identifying gameplay counts.'
      ]
    },
    {
      heading: 'Changes',
      paragraphs: [
        `We will update the date at the top of this page when the policy changes. Continued use after a material change means you should review the new text. Last updated ${LEGAL_UPDATED}.`
      ]
    }
  ]
};

const privacyZh: LegalDoc = {
  title: '隐私政策',
  intro:
    '本政策说明 Mahjong Hub（mahjonggame.org）如何处理个人信息。本站是免费浏览器游戏：没有真金赌博，积分不能兑换现金，四人桌是你对电脑对手，不是真人玩家。',
  sections: [
    {
      heading: '运营者',
      paragraphs: [
        `本站运营于 mahjonggame.org。隐私相关请求请发送至 ${EMAIL}。站内没有单独的法务信箱。`
      ]
    },
    {
      heading: '我们收集什么',
      paragraphs: [
        '游客游玩时，进度、道具和设置保存在你的设备（本地存储）。玩游戏不强制注册。',
        '登录后，我们会收到你选择的 Google、Facebook、X 或邮箱服务提供的姓名、邮箱和头像，并用会话 Cookie 保持登录。积分、道具、每日挑战连续天数和消除进度存在我们的数据库（Neon Postgres）。',
        '托管方 Vercel，以及在你同意后的 Google Analytics 4，可能处理 IP、浏览器、语言、大致地区和访问的页面。我们不会用这些流量数据识别你的身份。',
        '我们不收集银行卡号。本站目前没有结账店铺。'
      ]
    },
    {
      heading: '使用目的（GDPR 法律依据）',
      paragraphs: [
        '提供游戏与账号：合同 / 正当利益——让你能玩、保持连续登录、在其他设备恢复进度。',
        '安全与防刷：正当利益——频率限制、登录会话、只追加的积分流水。',
        '分析类 Cookie：同意。未在横幅中接受前不会启用。',
        '广告类 Cookie 与激励视频标识：同意。未选择同意且未接入广告网络前，不会加载广告 SDK。',
        '执法要求：法定义务。'
      ]
    },
    {
      heading: 'Cookie 与类似存储',
      paragraphs: [
        '必要：登录会话、同意选择、无障碍设置、添加到主屏幕的关闭记录、游客消除进度。',
        '分析：仅在你选择同意后启用 Google Analytics 4。',
        '广告：目前没有。日后若接入激励视频，将归入广告类别，拒绝后不会运行。',
        '详情与修改入口见 Cookie 政策页。'
      ]
    },
    {
      heading: '加州等美国州法（CCPA/CPRA）',
      paragraphs: [
        '我们不以金钱出售个人信息。分析和未来广告可能构成“共享”。你可以通过“拒绝非必要”、页脚的 Cookie 设置，或浏览器的全球隐私控制（GPC）拒绝该共享。',
        '你可以用账号邮箱联系我们，请求访问或删除账号数据。行使权利不会导致歧视性待遇。'
      ]
    },
    {
      heading: 'GDPR 权利',
      paragraphs: [
        '在适用欧盟/英国/欧洲经济区法律时，你可以请求访问、更正、删除、限制处理、携带数据，反对基于正当利益的处理，并随时撤回同意（不影响继续玩游戏）。',
        '你也可以向当地监管机构投诉。我们希望先直接处理问题，请来信。'
      ]
    },
    {
      heading: '儿童',
      paragraphs: [
        '本站面向一般用户，并非针对 13 岁以下儿童（在数字同意年龄为 16 岁的地区则为 16 岁以下）。我们不会故意收集儿童数据。若发现儿童账号，请来信删除。'
      ]
    },
    {
      heading: '处理方与跨境传输',
      paragraphs: [
        '网站由 Vercel 托管，数据库由 Neon 托管。登录时 Auth.js 会与你选择的 Google、Facebook、X 或邮件服务通信。Google Analytics 仅在同意后运行。',
        '上述服务可能在美国等地处理数据。在适用 GDPR 时，我们依赖其公布的传输机制（如标准合同条款）。'
      ]
    },
    {
      heading: '保存期限',
      paragraphs: [
        '游客数据直到你清除站点数据。账号数据在账号存续期间保留。会话会过期。积分与道具流水用于防作弊和恢复余额。你可以要求删除账号；我们会删除个人标识，并可能保留无法识别个人的汇总统计。'
      ]
    },
    {
      heading: '变更',
      paragraphs: [
        `政策变更时我们会更新页首日期。重大变更后请重新阅读。最近更新日期：${LEGAL_UPDATED}。`
      ]
    }
  ]
};

const privacyZhTw: LegalDoc = {
  title: '隱私權政策',
  intro:
    '本政策說明 Mahjong Hub（mahjonggame.org）如何處理個人資料。本站是免費瀏覽器遊戲：沒有真金賭博，積分不能兌換現金，四人桌是你對電腦對手，不是真人玩家。',
  sections: [
    {
      heading: '營運者',
      paragraphs: [`本站營運於 mahjonggame.org。隱私相關請求請寄至 ${EMAIL}。`]
    },
    {
      heading: '我們收集什麼',
      paragraphs: [
        '訪客遊玩時，進度、道具與設定存在你的裝置（本機儲存）。不必註冊也能玩。',
        '登入後，我們會收到你選擇的 Google、Facebook、X 或電子郵件服務提供的姓名、電子郵件與頭像，並以工作階段 Cookie 維持登入。積分、道具、每日挑戰連續天數與消除進度存在資料庫（Neon Postgres）。',
        '託管商 Vercel，以及在你同意後的 Google Analytics 4，可能處理 IP、瀏覽器、語言、大致地區與造訪頁面。',
        '我們不收集信用卡號。本站目前沒有結帳商店。'
      ]
    },
    {
      heading: '使用目的',
      paragraphs: [
        '提供遊戲與帳號、安全防刷：契約 / 正當利益。分析與廣告識別碼：同意，未同意前不會載入。'
      ]
    },
    {
      heading: 'Cookie',
      paragraphs: [
        '必要：登入、同意紀錄、無障礙設定、主畫面安裝提示關閉、訪客進度。分析僅在同意後啟用。廣告目前未接入。詳見 Cookie 政策。'
      ]
    },
    {
      heading: 'CCPA / GDPR 權利',
      paragraphs: [
        '我們不以金錢出售個人資料。你可拒絕非必要 Cookie，或使用全球隱私控制（GPC）。適用 GDPR 時可請求近用、更正、刪除、限制、攜出與反對。兒童：本站非針對 13 歲（或當地數位同意年齡）以下使用者。'
      ]
    },
    {
      heading: '處理方、保存與變更',
      paragraphs: [
        `網站由 Vercel 託管，資料庫由 Neon 託管。帳號資料於帳號存續期間保存。最近更新日期：${LEGAL_UPDATED}。`
      ]
    }
  ]
};

const privacyJa: LegalDoc = {
  title: 'プライバシーポリシー',
  intro:
    '本ポリシーは Mahjong Hub（mahjonggame.org）が個人データをどう扱うかを説明します。本サイトは無料のブラウザゲームです。現金賭博はなく、ポイントは換金できません。四人卓の相手はコンピュータであり、他のプレイヤーではありません。',
  sections: [
    {
      heading: '運営',
      paragraphs: [`サイトは mahjonggame.org で運営しています。プライバシーに関する連絡先は ${EMAIL} です。`]
    },
    {
      heading: '取得する情報',
      paragraphs: [
        'ゲストプレイでは進行・アイテム・設定を端末（ローカルストレージ）に保存します。アカウントは必須ではありません。',
        'ログインすると、選択した Google / Facebook / X / メール事業者が共有する氏名・メール・画像と、ログイン維持用のセッション Cookie を受け取ります。ポイント、アイテム、デイリー連続、ソリティア進行はデータベース（Neon Postgres）に保存します。',
        'ホスティングの Vercel と、同意後の Google Analytics 4 は IP、ブラウザ、言語、おおよその地域、閲覧ページを処理する場合があります。',
        'クレジットカード番号は取得しません。決済ショップはまだありません。'
      ]
    },
    {
      heading: '利用目的',
      paragraphs: [
        'ゲーム提供とアカウント、不正防止：契約 / 正当な利益。分析・広告識別子：同意。同意するまで SDK は読み込みません。'
      ]
    },
    {
      heading: 'Cookie',
      paragraphs: [
        '必須：ログイン、同意記録、アクセシビリティ、ホーム画面追加の非表示、ゲスト進行。分析は同意後のみ。広告は未接続です。詳細は Cookie ポリシーを参照してください。'
      ]
    },
    {
      heading: '権利',
      paragraphs: [
        '金銭による個人情報の販売は行いません。非必須 Cookie の拒否、または Global Privacy Control（GPC）で共有を拒否できます。GDPR が適用される場合、開示・訂正・削除・制限・ポータビリティ・異議を請求できます。13 歳未満（地域により 16 歳未満）向けではありません。'
      ]
    },
    {
      heading: '委託・保管・改定',
      paragraphs: [
        `ホスティングは Vercel、データベースは Neon です。最終更新日は ${LEGAL_UPDATED} です。`
      ]
    }
  ]
};

const privacyKo: LegalDoc = {
  title: '개인정보 처리방침',
  intro:
    '이 방침은 Mahjong Hub(mahjonggame.org)가 개인정보를 어떻게 다루는지 설명합니다. 본 사이트는 무료 브라우저 게임입니다. 현금 도박이 없고 포인트는 환전할 수 없으며, 4인 테이블의 상대는 컴퓨터입니다.',
  sections: [
    {
      heading: '운영자',
      paragraphs: [`사이트는 mahjonggame.org에서 운영합니다. 개인정보 문의: ${EMAIL}.`]
    },
    {
      heading: '수집 항목',
      paragraphs: [
        '게스트 플레이 시 진행·아이템·설정은 기기(로컬 저장소)에 남습니다. 계정 없이 플레이할 수 있습니다.',
        '로그인하면 선택한 Google, Facebook, X 또는 이메일 제공자가 공유하는 이름·이메일·프로필 사진과 세션 쿠키를 받습니다. 포인트, 아이템, 일일 도전 연속, 솔리테어 진행은 데이터베이스(Neon Postgres)에 저장합니다.',
        '호스팅(Vercel)과 동의한 경우에만 Google Analytics 4가 IP, 브라우저, 언어, 대략적 지역, 방문 페이지를 처리할 수 있습니다.',
        '카드 번호는 수집하지 않습니다. 결제 상점은 아직 없습니다.'
      ]
    },
    {
      heading: '이용 목적',
      paragraphs: [
        '게임·계정 제공 및 부정 이용 방지: 계약 / 정당한 이익. 분석·광고 식별자: 동의. 동의 전에는 SDK를 불러오지 않습니다.'
      ]
    },
    {
      heading: '쿠키',
      paragraphs: [
        '필수: 로그인, 동의 기록, 접근성, 홈 화면 추가 닫기, 게스트 진행. 분석은 동의 후에만. 광고는 아직 연결되지 않았습니다. 자세한 내용은 쿠키 정책을 보세요.'
      ]
    },
    {
      heading: '권리',
      paragraphs: [
        '개인정보를 돈 받고 판매하지 않습니다. 비필수 쿠키 거부 또는 Global Privacy Control(GPC)로 공유를 거절할 수 있습니다. GDPR이 적용되면 열람·정정·삭제·제한·이동·반대를 요청할 수 있습니다. 13세(또는 해당 지역 디지털 동의 연령) 미만을 대상으로 하지 않습니다.'
      ]
    },
    {
      heading: '처리위탁·보관·변경',
      paragraphs: [
        `호스팅은 Vercel, 데이터베이스는 Neon입니다. 최종 업데이트: ${LEGAL_UPDATED}.`
      ]
    }
  ]
};

const cookiesEn: LegalDoc = {
  title: 'Cookie Policy',
  intro:
    'This page lists the cookies and similar storage Mahjong Hub uses, and how to change your choice. Analytics and advertising stay off until you opt in.',
  sections: [
    {
      heading: 'Necessary (always on)',
      paragraphs: [
        'Sign-in session (Auth.js) — keeps you logged in.',
        'mh.consent.v1 — remembers Accept / Reject / custom categories.',
        'mahjong-hub.table-preferences.v1 — tile size, contrast, motion, colorblind marks.',
        'Guest solitaire keys (item ledger, daily streak, first-seen) — so anonymous play still works in 60 seconds.',
        'PWA install dismiss — stops repeating the add-to-home-screen hint.'
      ]
    },
    {
      heading: 'Analytics (opt-in)',
      paragraphs: [
        'Google Analytics 4 loads only after you accept analytics. It helps us see first-tile time, clears, and whether the PWA prompt is useful. We do not send tile layouts or hand contents.'
      ]
    },
    {
      heading: 'Advertising (opt-in, not live yet)',
      paragraphs: [
        'No advertising or rewarded-video SDK is installed today. When one is connected it will require this category and a server-side reward receipt. Turning the category off will stop those scripts.'
      ]
    },
    {
      heading: 'How to change your mind',
      paragraphs: [
        'Use Cookie settings in the footer, or your browser site-data controls. A Global Privacy Control (GPC) signal is treated as a request not to share for ads/analytics until you explicitly opt in.'
      ]
    }
  ]
};

const cookiesZh: LegalDoc = {
  title: 'Cookie 政策',
  intro: '本页列出 Mahjong Hub 使用的 Cookie 与类似存储，以及如何更改选择。分析和广告在你同意之前保持关闭。',
  sections: [
    {
      heading: '必要（始终开启）',
      paragraphs: [
        '登录会话、同意记录、无障碍与色盲标记、游客消除进度、PWA 安装提示关闭。没有这些，站点无法记住你的隐私选择或保持登录。'
      ]
    },
    {
      heading: '分析（需同意）',
      paragraphs: ['仅在你接受分析后加载 Google Analytics 4。我们不发送牌面或手牌内容。']
    },
    {
      heading: '广告（需同意，尚未上线）',
      paragraphs: ['目前未安装广告或激励视频 SDK。接入后必须勾选本类别，并由服务端核销奖励。关闭后不会运行这些脚本。']
    },
    {
      heading: '如何更改',
      paragraphs: ['使用页脚的 Cookie 设置，或浏览器的站点数据控制。GPC 信号视为拒绝共享，直到你明确选择开启。']
    }
  ]
};

const cookiesZhTw: LegalDoc = {
  title: 'Cookie 政策',
  intro: '本頁列出本站使用的 Cookie 與類似儲存，以及如何更改選擇。分析與廣告在你同意前保持關閉。',
  sections: [
    {
      heading: '必要',
      paragraphs: ['登入工作階段、同意紀錄、無障礙與色盲標記、訪客進度、PWA 提示關閉。']
    },
    {
      heading: '分析與廣告',
      paragraphs: ['分析僅在同意後載入 Google Analytics 4。廣告 SDK 尚未接入。可用頁尾 Cookie 設定或 GPC 變更選擇。']
    }
  ]
};

const cookiesJa: LegalDoc = {
  title: 'Cookie ポリシー',
  intro: '本ページは Mahjong Hub が使う Cookie 等と、選択の変更方法を示します。分析と広告は同意するまでオフです。',
  sections: [
    {
      heading: '必須',
      paragraphs: ['ログイン、同意記録、アクセシビリティ／色覚サポート、ゲスト進行、PWA ヒント非表示。']
    },
    {
      heading: '分析と広告',
      paragraphs: ['分析は同意後のみ Google Analytics 4。広告 SDK は未導入です。フッターの Cookie 設定または GPC で変更できます。']
    }
  ]
};

const cookiesKo: LegalDoc = {
  title: '쿠키 정책',
  intro: 'Mahjong Hub가 사용하는 쿠키와 선택 변경 방법을 안내합니다. 분석과 광고는 동의 전까지 꺼져 있습니다.',
  sections: [
    {
      heading: '필수',
      paragraphs: ['로그인, 동의 기록, 접근성/색각 표시, 게스트 진행, PWA 안내 닫기.']
    },
    {
      heading: '분석과 광고',
      paragraphs: ['분석은 동의한 뒤에만 Google Analytics 4를 로드합니다. 광고 SDK는 아직 없습니다. 바닥글의 쿠키 설정 또는 GPC로 바꿀 수 있습니다.']
    }
  ]
};

const termsEn: LegalDoc = {
  title: 'Terms of Service',
  intro:
    'These terms cover your use of Mahjong Hub (mahjonggame.org) and any digital products we offer. By using the site you agree to them. If you do not agree, please do not use the site.',
  sections: [
    {
      heading: 'What Mahjong Hub is',
      paragraphs: [
        'Mahjong Hub is a free website for learning and practising mahjong. It offers games against AI opponents, lessons, guides and tools. Four-player tables are you against computer opponents, not other people.'
      ]
    },
    {
      heading: 'Not a gambling site',
      paragraphs: [
        'There is no real-money betting anywhere on Mahjong Hub. There is no gambling currency you can buy, and there are no cash prizes.',
        'Points are only used inside the site: to track progress and achievements and to unlock in-game items and cosmetic looks. Points cannot be exchanged for money, cannot be transferred to another person or account, and have no cash value.'
      ]
    },
    {
      heading: 'Accounts are optional',
      paragraphs: [
        'You can play without signing in. Signing in is only used to save your progress and achievements and to restore them on another device. You are responsible for keeping access to the sign-in method you use.'
      ]
    },
    {
      heading: 'Purchases',
      paragraphs: [
        'Mahjong Hub may sell digital products, such as study materials. Creem is the Merchant of Record for these orders: Creem sells the product to you and handles payment, sales tax or VAT, invoices and refunds. Mahjong Hub is the provider of the product and its content.',
        'The price and what is included are shown on the product page at the time you buy. Refunds follow our Refund Policy.'
      ]
    },
    {
      heading: 'Our content',
      paragraphs: [
        'The articles, lessons, tile artwork, game engine and other site content belong to Mahjong Hub. You may use them for your own personal learning.',
        `You may not copy or republish the site or large parts of it, and you may not use our content to train commercial AI models. If you want to use our content in another way, email ${EMAIL} and ask first.`
      ]
    },
    {
      heading: 'Acceptable use',
      paragraphs: [
        'Do not scrape or crawl the site in a way that puts load on our service. Do not reverse engineer the site or its games in order to redistribute them commercially. Do not use the site for anything illegal.',
        'We may limit or close access for accounts that break these rules.'
      ]
    },
    {
      heading: 'No guarantees',
      paragraphs: [
        'The site and its content are provided as they are. We try to explain rules accurately, but mahjong rules vary by region and club; for official play, the official rules of your region or club apply.',
        'We are not responsible for indirect losses that come from using the site, to the extent the law allows.'
      ]
    },
    {
      heading: 'Changes and contact',
      paragraphs: [
        `We may update these terms. The date at the top of this page shows the latest version. Last updated ${LEGAL_UPDATED}.`,
        `Questions about these terms: ${EMAIL}.`
      ]
    }
  ]
};

const termsZh: LegalDoc = {
  title: '服务条款',
  intro:
    '本条款适用于你使用 Mahjong Hub（mahjonggame.org）以及我们提供的数字产品。使用本站即表示你同意本条款；如不同意，请不要使用本站。',
  sections: [
    {
      heading: '本站是什么',
      paragraphs: [
        'Mahjong Hub 是一个免费的麻将学习与练习网站，提供 AI 对手对局、课程、指南和工具。四人桌是你对电脑对手，不是真人玩家。'
      ]
    },
    {
      heading: '本站不是赌博网站',
      paragraphs: [
        '本站任何地方都没有真钱下注，没有可购买的赌博货币，也没有现金奖励。',
        '积分只在站内使用：记录进度与成就，以及解锁游戏道具和外观。积分不能兑换现金，不能转让给他人或其他账号，没有任何现金价值。'
      ]
    },
    {
      heading: '账号可选',
      paragraphs: [
        '不登录也能玩。登录只用于保存进度与成就，并在其他设备上恢复。请自行保管好你所用登录方式的访问权限。'
      ]
    },
    {
      heading: '购买',
      paragraphs: [
        '本站可能出售数字产品（例如学习资料）。这些订单由 Creem 作为记录商户（Merchant of Record）：由 Creem 向你出售产品，并负责收款、销售税或增值税、发票和退款。本站是产品及其内容的提供方。',
        '价格和产品包含的内容以购买时产品页的说明为准。退款按本站的退款政策处理。'
      ]
    },
    {
      heading: '我们的内容',
      paragraphs: [
        '本站的文章、课程、牌面美术、游戏引擎和其他内容归 Mahjong Hub 所有。你可以用于个人学习。',
        `不得复制或转载整站或其中大部分内容，也不得用本站内容训练商业 AI 模型。如需以其他方式使用，请先发邮件至 ${EMAIL} 征得同意。`
      ]
    },
    {
      heading: '可接受的使用',
      paragraphs: [
        '不得以给服务器造成压力的方式抓取或爬取本站；不得为商业分发而逆向本站或其中的游戏；不得将本站用于任何违法用途。',
        '违反上述规则的账号，我们可能限制或关闭其访问。'
      ]
    },
    {
      heading: '免责声明',
      paragraphs: [
        '本站及其内容按“现状”提供。我们尽量准确讲解规则，但麻将规则因地区和俱乐部而异；正式对局请以你所在地区或俱乐部的官方规则为准。',
        '在法律允许的范围内，我们不对因使用本站而产生的间接损失负责。'
      ]
    },
    {
      heading: '变更与联系方式',
      paragraphs: [
        `我们可能更新本条款，页首日期即最新版本。最近更新日期：${LEGAL_UPDATED}。`,
        `关于本条款的问题，请发邮件至 ${EMAIL}。`
      ]
    }
  ]
};

const termsZhTw: LegalDoc = {
  title: '服務條款',
  intro:
    '本條款適用於你使用 Mahjong Hub（mahjonggame.org）以及我們提供的數位產品。使用本站即表示你同意本條款；如不同意，請不要使用本站。',
  sections: [
    {
      heading: '本站是什麼',
      paragraphs: [
        'Mahjong Hub 是一個免費的麻將學習與練習網站，提供 AI 對手對局、課程、指南和工具。四人桌是你對電腦對手，不是真人玩家。'
      ]
    },
    {
      heading: '本站不是賭博網站',
      paragraphs: [
        '本站任何地方都沒有真錢下注，沒有可購買的賭博貨幣，也沒有現金獎勵。',
        '積分只在站內使用：記錄進度與成就，以及解鎖遊戲道具和外觀。積分不能兌換現金，不能轉讓給他人或其他帳號，沒有任何現金價值。'
      ]
    },
    {
      heading: '帳號可選',
      paragraphs: [
        '不登入也能玩。登入只用於保存進度與成就，並在其他裝置上恢復。請自行保管好你所用登入方式的存取權限。'
      ]
    },
    {
      heading: '購買',
      paragraphs: [
        '本站可能販售數位產品（例如學習資料）。這些訂單由 Creem 擔任記錄商戶（Merchant of Record）：由 Creem 向你販售產品，並負責收款、銷售稅或加值稅、發票和退款。本站是產品及其內容的提供方。',
        '價格和產品包含的內容以購買時產品頁的說明為準。退款依本站的退款政策處理。'
      ]
    },
    {
      heading: '我們的內容',
      paragraphs: [
        '本站的文章、課程、牌面美術、遊戲引擎和其他內容歸 Mahjong Hub 所有。你可以用於個人學習。',
        `不得複製或轉載整站或其中大部分內容，也不得用本站內容訓練商業 AI 模型。如需以其他方式使用，請先寄信至 ${EMAIL} 徵得同意。`
      ]
    },
    {
      heading: '可接受的使用',
      paragraphs: [
        '不得以對伺服器造成負擔的方式抓取或爬取本站；不得為商業散布而逆向本站或其中的遊戲；不得將本站用於任何違法用途。',
        '違反上述規則的帳號，我們可能限制或關閉其存取。'
      ]
    },
    {
      heading: '免責聲明',
      paragraphs: [
        '本站及其內容依「現狀」提供。我們盡量準確講解規則，但麻將規則因地區和俱樂部而異；正式對局請以你所在地區或俱樂部的官方規則為準。',
        '在法律允許的範圍內，我們不對因使用本站而產生的間接損失負責。'
      ]
    },
    {
      heading: '變更與聯絡方式',
      paragraphs: [
        `我們可能更新本條款，頁首日期即最新版本。最近更新日期：${LEGAL_UPDATED}。`,
        `關於本條款的問題，請寄信至 ${EMAIL}。`
      ]
    }
  ]
};

const refundsEn: LegalDoc = {
  title: 'Refund Policy',
  intro:
    'If a digital product from Mahjong Hub is not right for you, you can get your money back. This page explains how.',
  sections: [
    {
      heading: '7-day refund, no reason needed',
      paragraphs: [
        'You can ask for a full refund within 7 days of buying any digital product. You do not need to tell us why.'
      ]
    },
    {
      heading: 'How to ask for a refund',
      paragraphs: [
        `Email ${EMAIL} with the email address you used for the order and your Creem order number. Or use the link in your Creem order email to request the refund yourself.`
      ]
    },
    {
      heading: 'Who handles the refund',
      paragraphs: [
        'Creem is the Merchant of Record for our orders, so Creem processes the refund. We will refund you to the original payment method. How long it takes to reach you depends on your bank or payment provider.'
      ]
    },
    {
      heading: 'Exceptions',
      paragraphs: [
        'We may refuse a refund in clear cases of abuse, such as the same account buying and refunding again and again, or bulk purchases made to take content for free.'
      ]
    },
    {
      heading: 'Help with a product',
      paragraphs: [
        `For any other question about a product, email ${EMAIL}. We will reply within 2 business days.`,
        `Last updated ${LEGAL_UPDATED}.`
      ]
    }
  ]
};

const refundsZh: LegalDoc = {
  title: '退款政策',
  intro: '如果你购买的 Mahjong Hub 数字产品不合适，可以申请退款。本页说明具体做法。',
  sections: [
    {
      heading: '7 天无理由退款',
      paragraphs: ['任何数字产品自购买之日起 7 天内，都可以申请全额退款，无需说明理由。']
    },
    {
      heading: '如何申请',
      paragraphs: [
        `发邮件至 ${EMAIL}，附上下单时使用的邮箱和 Creem 订单号；也可以通过 Creem 订单邮件里的链接自助申请。`
      ]
    },
    {
      heading: '由谁处理',
      paragraphs: [
        'Creem 是我们订单的记录商户（Merchant of Record），退款由 Creem 处理，款项退回原支付方式。到账时间取决于你的银行或支付渠道。'
      ]
    },
    {
      heading: '例外情况',
      paragraphs: [
        '对于明显的滥用行为，例如同一账号反复购买再退款，或为了免费获取内容而批量购买，我们可以拒绝退款。'
      ]
    },
    {
      heading: '售后支持',
      paragraphs: [
        `产品相关的其他问题，也请发邮件至 ${EMAIL}，我们会在 2 个工作日内回复。`,
        `最近更新日期：${LEGAL_UPDATED}。`
      ]
    }
  ]
};

const refundsZhTw: LegalDoc = {
  title: '退款政策',
  intro: '如果你購買的 Mahjong Hub 數位產品不合適，可以申請退款。本頁說明具體做法。',
  sections: [
    {
      heading: '7 天無理由退款',
      paragraphs: ['任何數位產品自購買之日起 7 天內，都可以申請全額退款，無需說明理由。']
    },
    {
      heading: '如何申請',
      paragraphs: [
        `寄信至 ${EMAIL}，附上下單時使用的電子郵件和 Creem 訂單編號；也可以透過 Creem 訂單郵件裡的連結自助申請。`
      ]
    },
    {
      heading: '由誰處理',
      paragraphs: [
        'Creem 是我們訂單的記錄商戶（Merchant of Record），退款由 Creem 處理，款項退回原付款方式。入帳時間取決於你的銀行或支付管道。'
      ]
    },
    {
      heading: '例外情況',
      paragraphs: [
        '對於明顯的濫用行為，例如同一帳號反覆購買再退款，或為了免費取得內容而大量購買，我們可以拒絕退款。'
      ]
    },
    {
      heading: '售後支援',
      paragraphs: [
        `產品相關的其他問題，也請寄信至 ${EMAIL}，我們會在 2 個工作天內回覆。`,
        `最近更新日期：${LEGAL_UPDATED}。`
      ]
    }
  ]
};

const privacyByLocale: Record<string, LegalDoc> = {
  en: privacyEn,
  zh: privacyZh,
  'zh-TW': privacyZhTw,
  ja: privacyJa,
  ko: privacyKo
};

const cookiesByLocale: Record<string, LegalDoc> = {
  en: cookiesEn,
  zh: cookiesZh,
  'zh-TW': cookiesZhTw,
  ja: cookiesJa,
  ko: cookiesKo
};

export function getPrivacyDoc(locale: string): LegalDoc {
  return privacyByLocale[locale] ?? privacyEn;
}

export function getCookiesDoc(locale: string): LegalDoc {
  return cookiesByLocale[locale] ?? cookiesEn;
}

const termsByLocale: Record<string, LegalDoc> = {
  en: termsEn,
  zh: termsZh,
  'zh-TW': termsZhTw
};

const refundsByLocale: Record<string, LegalDoc> = {
  en: refundsEn,
  zh: refundsZh,
  'zh-TW': refundsZhTw
};

export function getTermsDoc(locale: string): LegalDoc {
  return termsByLocale[locale] ?? termsEn;
}

export function getRefundsDoc(locale: string): LegalDoc {
  return refundsByLocale[locale] ?? refundsEn;
}
