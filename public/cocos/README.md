# Cocos Connect build (served by Next.js)

Place the Creator **web-mobile** output here as:

```
public/cocos/connect/index.html
public/cocos/connect/...
```

From `mahjong-hub/`:

```bash
npm run sync:cocos-connect
```

Requires `MahjongCoreGame/build/web-mobile` (scenes: main + Connect).
Enable with `NEXT_PUBLIC_COCOS_CONNECT=true`.
