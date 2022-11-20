import type SurveyQuestion from '@app/models/SurveyQuestion';

type SurveyPreviewProps = {
  questions: SurveyQuestion[];
};

export default function SurveyPreview({ questions }: SurveyPreviewProps) {
  return (
    <div className="flex flex-col space-y-6">
      {questions.map((question) => (
        <div key={question.question} className="flex flex-col">
          <div className="my-2 text-xl font-bold">{question.question}</div>
          <div className="flex justify-start space-x-8 py-4 sm:space-x-16">
            {question.answers.map((answer) => (
              <div key={answer.name} className="cursor-pointer">
                <div className="font-medium">
                  <div className="flex flex-col items-center opacity-75">
                    <div>{answer.name}</div>
                    <div className="brand-shadow mt-2 rounded-lg bg-white p-4 shadow-black/25 dark:bg-neutral-700">
                      <div className="h-3 w-3 rounded-lg bg-neutral-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
