import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import {
  selectEnrollDynamicCourseData,
  selectEnrollDynamicCourseStatus,
  enrollDynamicCourse,
} from '../enrollDynamicCourseSlice';
import { selectGlobalKnowledgeTestResultsStatsData } from './globalKnowledgeTestResultsStatsSlice';
import { useAppSelector } from '@app/hooks';
import FancyCard from '@app/components/FancyCard';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import type GlobalKnowledgeTest from '@app/models/GlobalKnowledgeTest';

type GlobalKnowledgeTestFormCompletedProps = {
  globalKnowledgeTest: GlobalKnowledgeTest;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GlobalKnowledgeTestFormCompleted({
  globalKnowledgeTest,
  translations,
}: GlobalKnowledgeTestFormCompletedProps) {
  const router = useRouter();
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
          globalKnowledgeTestId: globalKnowledgeTest.id,
          name: translations('DynamicCourse.course-name'),
        })
      );
    } catch (error) {
      console.error(error);
    }
  };
  const globalKnowledgeTestResultsStatsData = useAppSelector(
    selectGlobalKnowledgeTestResultsStatsData
  );

  const correctAnswersPercentage =
    Math.round(
      (globalKnowledgeTestResultsStatsData?.total_correct_answers /
        globalKnowledgeTestResultsStatsData?.total_answers) *
        100
    ) || 0;

  const handleBack = () => {
    router.back();
  };

  return (
    <div>
      {globalKnowledgeTestResultsStatsData && (
        <div className="text-center">
          {globalKnowledgeTestResultsStatsData.test_passed ? (
            <h3 className="text-green-500 dark:text-green-400">
              <CheckBadgeIcon className="mr-1 mb-1 inline h-9 w-9" />
              {translations('KnowledgeTest.knowledge-test-passed')}
            </h3>
          ) : (
            <h3 className="text-red-500 dark:text-red-400">
              <XCircleIcon className="mr-1 mb-1 inline h-9 w-9" />
              {translations('KnowledgeTest.knowledge-test-failed')}
            </h3>
          )}
          <div>
            {translations('KnowledgeTest.knowledge-test-completed')}
            &nbsp;
            <span className="font-bold">{correctAnswersPercentage}%</span>
          </div>
          <div>
            {translations('KnowledgeTest.total-correct-answers')}
            &nbsp;
            <span className="font-bold">
              {globalKnowledgeTestResultsStatsData.total_correct_answers}/
              {globalKnowledgeTestResultsStatsData.total_answers}
            </span>
            <div className="mt-6 flex flex-col items-center justify-center">
              <IconButton
                onClick={handleBack}
                type="button"
                icon={<ArrowLeftIcon className="h-5 w-5" />}>
                {translations('Form.back')}
              </IconButton>
            </div>
          </div>
        </div>
      )}
      {correctAnswersPercentage < 100 && (
        <div className="mt-6">
          <div>
            <h4 className="whitespace-pre-wrap text-center">
              {translations('KnowledgeTest.alert-missing-knowledge')}
            </h4>
            <div className="my-6 flex flex-col items-center">
              {enrollDynamicCourseData &&
              enrollDynamicCourseStatus === 'succeeded' ? (
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
          </div>
        </div>
      )}
    </div>
  );
}
