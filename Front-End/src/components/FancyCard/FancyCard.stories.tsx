import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import FancyCard from '.';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import type Course from '@app/models/Course';

export default {
  title: 'FancyCard',
  component: FancyCard,
} as ComponentMeta<typeof FancyCard>;

const course: Course = {
  id: 1,
  name: 'Introduction to React',
  description: 'This is a course about React',
  featured: true,
  enrolled: true,
  total_lessons_count: 3,
  total_completed_lessons_count: 1,
  lessons: [
    {
      id: 1,
      name: 'Introduction',
      description: 'This is an introduction to React',
      type: 1,
      start_date: '2020-01-01',
      completed: false,
    },
    {
      id: 2,
      name: 'Installation',
      description: 'This is an installation of React',
      type: 1,
      start_date: '2020-01-01',
      completed: false,
    },
    {
      id: 3,
      name: 'Hello World',
      description: 'This is a Hello World example',
      type: 2,
      start_date: '2020-01-01',
      completed: false,
    },
  ],
};

export const Default: ComponentStory<typeof FancyCard> = (args) => (
  <FancyCard
    key={course.id}
    title={course.name}
    description={
      <div className="flex flex-col">
        {course.description}
        <div>
          <div className="mt-4 mb-1 text-xs text-neutral-400">
            {course.lessons?.length > 0 &&
              course.lessons?.map((lesson) => (
                <div key={lesson.id}>
                  <div className="text-sky-900 dark:text-sky-300">
                    {lesson.name}
                  </div>
                </div>
              ))}
            ...
          </div>
        </div>
      </div>
    }
    cardColor="bg-white"
    shadowColor="shadow-black/25"
    hoverShadowColor="hover:shadow-black/25"
    bottomControls={
      course.enrolled ? (
        <IconButtonLink
          className="w-fit"
          variant={IconButtonLinkVariant.OUTLINE_PRIMARY}
          icon={<CheckBadgeIcon className="h-5 w-5" />}></IconButtonLink>
      ) : (
        <IconButton
          variant={IconButtonVariant.PRIMARY}
          icon={<CheckCircleIcon className="h-5 w-5" />}></IconButton>
      )
    }
  />
);
