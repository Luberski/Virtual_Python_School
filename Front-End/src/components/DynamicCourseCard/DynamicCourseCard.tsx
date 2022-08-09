import { LightBulbIcon } from '@heroicons/react/outline';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';

export default function DynamicCourseCard() {
  return (
    <div className="flex max-h-96 w-80 items-center justify-center rounded-lg bg-white text-center font-medium text-indigo-600 outline-dashed outline-2 outline-indigo-600 transition ease-in-out hover:bg-indigo-100 dark:bg-neutral-800 dark:hover:bg-indigo-900">
      <IconButtonLink
        variant={IconButtonLinkVariant.FLAT_PRIMARY}
        className="dark:hover:bg-transparent dark:hover:text-indigo-200"
        icon={<LightBulbIcon className="h-5 w-5" />}>
        Try dynamic course
      </IconButtonLink>
    </div>
  );
}