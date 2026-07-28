import { useTranslations } from 'next-intl';

export default function AdSlot() {
  const t = useTranslations('ad');

  return (
    <div className="my-6 mx-auto max-w-3xl rounded-xl border-2 border-dashed border-gray-300 p-6 text-center text-gray-400">
      <div className="text-xs uppercase tracking-widest">{t('label')}</div>
      <div className="mt-2 text-sm">
        （Ad placement · AdMob / 优量汇 激励视频待接入）
      </div>
    </div>
  );
}
