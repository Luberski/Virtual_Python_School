import React from 'react';
import Link from 'next/link';
import ButtonLink, { ButtonLinkVariant } from '../ButtonLink';

type FancyCardProps = {
  title: string;
  description: string | React.ReactNode;
  link: string;
  buttonText: string;
  cardColor?: string;
  darkCardColor?: string;
  shadowColor?: string;
  hoverShadowColor?: string;
};

export default function FancyCard({
  link,
  title,
  description,
  buttonText,
  cardColor = 'bg-gray-200',
  darkCardColor = 'dark:bg-gray-900',
  shadowColor = 'shadow-gray-200/50',
  hoverShadowColor = 'hover:shadow-gray-400/50',
}: FancyCardProps) {
  return (
    <div
      className={`flex flex-col p-8 ${cardColor} ${darkCardColor} border dark:border-gray-400 shadow-md hover:shadow-lg ${hoverShadowColor} transition duration-500 ease-in-out hover:scale-110 ${shadowColor} rounded-lg text-gray-700 dark:text-gray-100`}>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="max-w-xs h-8 break-words">{description}</p>
      <Link href={link} passHref={true}>
        <ButtonLink variant={ButtonLinkVariant.SECONDARY} className="mt-16">
          {buttonText}
        </ButtonLink>
      </Link>
    </div>
  );
}
