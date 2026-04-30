import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { i18n, t } = useTranslation();

  const lang = i18n.language as 'zh' | 'en';

  const setLang = useCallback(
    (l: 'zh' | 'en') => {
      i18n.changeLanguage(l);
    },
    [i18n],
  );

  const toggleLang = useCallback(() => {
    i18n.changeLanguage(lang === 'zh' ? 'en' : 'zh');
  }, [i18n, lang]);

  return { lang, setLang, toggleLang, t };
}
