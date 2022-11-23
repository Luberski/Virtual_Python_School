import type React from 'react';

type FancyCardProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  cardColor?: string;
  darkCardColor?: string;
  shadowColor?: string;
  hoverShadowColor?: string;
  bottomControls?: React.ReactNode;
};

export default function FancyCard({
  title,
  description,
  cardColor = 'bg-neutral-200',
  darkCardColor = 'dark:bg-neutral-800',
  shadowColor = 'shadow-neutral-200/50',
  hoverShadowColor = 'hover:shadow-neutral-400/50',
  bottomControls,
}: FancyCardProps) {
  return (
    <div
      className={`flex flex-col justify-between p-6 ${cardColor} ${darkCardColor} brand-shadow2 border shadow-black/25 dark:border-neutral-400 ${hoverShadowColor} transition duration-500 ease-in-out ${shadowColor} max-h-[768px] w-80 rounded-lg text-neutral-700 dark:text-neutral-100`}>
      <div className="break-words text-xl font-bold">{title}</div>
      <div className="h-full truncate break-words">{description}</div>
      <div className="mt-3 items-end pt-1">{bottomControls}</div>
    </div>
  );
}
