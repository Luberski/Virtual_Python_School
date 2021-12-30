import React from "react";
import Link from "next/link";
import ButtonLink from "../ButtonLink";

type FancyCardProps = {
  title: string;
  description: string | React.ReactNode;
  link: string;
  buttonText: string;
  cardColor?: string;
  shadowColor?: string;
  hoverShadowColor?: string;
};

export default function FancyCard({
  link,
  title,
  description,
  buttonText,
  cardColor = "bg-gray-200",
  shadowColor = "shadow-gray-200/50",
  hoverShadowColor = "hover:shadow-gray-400/50",
}: FancyCardProps) {
  return (
    <div
      className={`flex flex-col p-8 ${cardColor} shadow-md hover:shadow-xl ${hoverShadowColor} transition duration-500 ease-in-out hover:scale-110 ${shadowColor} rounded-xl text-gray-700`}
    >
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="max-w-xs h-8">{description}</p>
      <Link href={link} passHref={true}>
        <ButtonLink className="btn-secondary mt-16 w-42">
          {buttonText}
        </ButtonLink>
      </Link>
    </div>
  );
}
