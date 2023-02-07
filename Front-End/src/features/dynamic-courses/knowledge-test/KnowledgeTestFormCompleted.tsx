import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/router';
import { selectKnowledgeTestResultsStatsData } from './knowledgeTestResultsStatsSlice';
import { useAppSelector } from '@app/hooks';
import IconButton from '@app/components/IconButton';

type KnowledgeTestFormCompletedProps = {
  translations: (key: string, ...params: unknown[]) => string;
};

export default function KnowledgeTestFormCompleted({
  translations,
}: KnowledgeTestFormCompletedProps) {
  const router = useRouter();

  const knowledgeTestResultsStatsData = useAppSelector(
    selectKnowledgeTestResultsStatsData
  );

  const correctAnswersPercentage =
    Math.round(
      (knowledgeTestResultsStatsData?.total_correct_answers /
        knowledgeTestResultsStatsData?.total_answers) *
        100
    ) || 0;

  const handleBack = () => {
    router.back();
  };

  return (
    knowledgeTestResultsStatsData && (
      <div className="text-center">
        {knowledgeTestResultsStatsData.test_passed ? (
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
            {knowledgeTestResultsStatsData.total_correct_answers}/
            {knowledgeTestResultsStatsData.total_answers}
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
    )
  );
}
