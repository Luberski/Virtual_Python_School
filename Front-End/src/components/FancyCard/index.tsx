import type React from 'react';
import Link from 'next/link';
import Button, { ButtonVariant } from '@app/components/Button';
import ButtonLink, { ButtonLinkVariant } from '@app/components/ButtonLink';

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
  cardColor = 'bg-neutral-200',
  darkCardColor = 'dark:bg-neutral-800',
  shadowColor = 'shadow-neutral-200/50',
  hoverShadowColor = 'hover:shadow-neutral-400/50',
  onClick,
}: FancyCardProps) {
  return (
    <div
      className={`flex flex-col justify-between p-6 ${cardColor} ${darkCardColor} brand-shadow2 border shadow-black/25 dark:border-neutral-400 ${hoverShadowColor} transition duration-500 ease-in-out ${shadowColor} rounded-lg text-neutral-700 dark:text-neutral-100`}>
      <p title={title} className="break-words text-2xl font-bold">
        {title}
      </p>
      <p className="h-full max-h-96 max-w-xs truncate break-words">
        {description}
      </p>

      {link ? (
        <Link href={link} passHref={true}>
          <ButtonLink
            variant={ButtonLinkVariant.OUTLINE_PRIMARY}
            className="mt-16">
            {buttonText}
          </ButtonLink>
        </Link>
      ) : (
        <Button
          variant={ButtonVariant.OUTLINE_PRIMARY}
          className="mt-16"
          onClick={onClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
}
