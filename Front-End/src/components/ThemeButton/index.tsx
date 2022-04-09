import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

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
      onClick={switchTheme}
      id="switchTheme"
      className="flex justify-center items-center mx-4 w-10 h-10 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg focus:outline-none transition duration-150 ease-in-out"
      title={t('Home.switch-theme')}>
      {isMounted && theme === 'dark' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-gray-100"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-yellow-500"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
};
