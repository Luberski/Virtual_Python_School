import type React from 'react';
import Link from 'next/link';
import Button, { ButtonVariant } from '../Button';
import ButtonLink, { ButtonLinkVariant } from '../ButtonLink';

type FancyCardProps = {
  title: string;
  description: string | React.ReactNode;
  link?: string;
  buttonText: string;
  cardColor?: string;
  darkCardColor?: string;
  shadowColor?: string;
  hoverShadowColor?: string;
  onClick?: () => void;
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
  onClick,
}: FancyCardProps) {
  return (
    <div
      className={`flex flex-col justify-between p-8 ${cardColor} ${darkCardColor} border shadow-md hover:shadow-lg dark:border-gray-400 ${hoverShadowColor} transition duration-500 ease-in-out hover:scale-110 ${shadowColor} rounded-lg text-gray-700 dark:text-gray-100`}>
      <h3 title={title} className="break-words text-xl font-bold">
        {title}
      </h3>
      <p className="h-full max-h-96 max-w-xs truncate break-words">
        {description}
      </p>

      {link ? (
        <Link href={link} passHref={true}>
          <ButtonLink variant={ButtonLinkVariant.SECONDARY} className="mt-16">
            {buttonText}
          </ButtonLink>
        </Link>
      ) : (
        <Button
          variant={ButtonVariant.SECONDARY}
          className="mt-16"
          onClick={onClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
}
