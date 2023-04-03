import { BoltIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';

type DynamicCourseCardProps = {
  children: React.ReactNode;
};

export default function DynamicCourseCard({
  children,
}: DynamicCourseCardProps) {
  return (
    <Link href="/dynamic-courses/globalKnowledgeTest" passHref>
      <IconButtonLink
        variant={IconButtonLinkVariant.DASHED_PRIMARY}
        icon={<BoltIcon className="h-5 w-5" />}>
        {children}
      </IconButtonLink>
    </Link>
  );
}
