import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';

export const ThemeButton = () => {
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const { theme, setTheme } = useTheme();

  const switchTheme = () => {
    if (isMounted) {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <button
      type="button"
      onClick={switchTheme}
      id="switchTheme"
      className="mx-4 flex h-10 w-10 items-center justify-center rounded-lg transition duration-150 ease-in-out hover:bg-neutral-200 focus:outline-none dark:hover:bg-neutral-700"
      title={t('Home.switch-theme')}>
      {isMounted && theme === 'dark' ? (
        <MoonIcon className="h-5 w-5 text-neutral-100" />
      ) : (
        <SunIcon className="h-5 w-5 text-yellow-500" />
      )}
    </button>
  );
};
