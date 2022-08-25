import { useDispatch } from 'react-redux';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import {
  enrollDynamicCourse,
  selectEnrollDynamicCourseData,
  selectEnrollDynamicCourseStatus,
} from '@app/features/dynamic-courses/enrollDynamicCourseSlice';
import type Survey from '@app/models/Survey';
import { useAppSelector } from '@app/hooks';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import FancyCard from '@app/components/FancyCard';

type SurveyFormCompletedProps = {
  survey: Survey;
  translations: (key: string) => string;
};

export default function SurveyFormCompleted({
  survey,
  translations,
}: SurveyFormCompletedProps) {
  const dispatch = useDispatch();
  const enrollDynamicCourseData = useAppSelector(selectEnrollDynamicCourseData);
  const enrollDynamicCourseStatus = useAppSelector(
    selectEnrollDynamicCourseStatus
  );

  const onEnrollDynamicCourseSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      await dispatch(
        enrollDynamicCourse({
          surveyId: survey.id,
          name: translations('DynamicCourse.course-name'),
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {enrollDynamicCourseData && enrollDynamicCourseStatus === 'succeeded' ? (
        <div className="flex flex-col items-center space-y-6">
          <FancyCard
            key={enrollDynamicCourseData.id}
            title={
              <div className="text-indigo-600">
                {enrollDynamicCourseData.name}
              </div>
            }
            description={
              <div className="flex flex-col">
                <div>
                  <div className="mt-4 mb-1 text-xs text-neutral-400">
                    {translations('Manage.name')}
                  </div>
                  {enrollDynamicCourseData.lessons?.length > 0 &&
                    enrollDynamicCourseData.lessons?.map((lesson) => (
                      <div key={lesson.id}>
                        <div className="text-indigo-900 dark:text-indigo-300">
                          {lesson.name}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            }
            cardColor="bg-white"
            shadowColor="shadow-black/25"
            hoverShadowColor="hover:shadow-black/25"
            bottomControls={
              <Link href="/courses/enrolled">
                <IconButtonLink
                  variant={IconButtonLinkVariant.OUTLINE_PRIMARY}
                  icon={<CheckBadgeIcon className="h-5 w-5" />}>
                  {translations('Courses.enrolled')}
                </IconButtonLink>
              </Link>
            }
          />
        </div>
      ) : (
        <form onSubmit={onEnrollDynamicCourseSubmit}>
          <IconButton
            variant={IconButtonVariant.PRIMARY}
            type="submit"
            icon={<CheckBadgeIcon className="h-5 w-5" />}>
            {translations('Courses.enroll')}
          </IconButton>
        </form>
      )}
    </div>
  );
}
