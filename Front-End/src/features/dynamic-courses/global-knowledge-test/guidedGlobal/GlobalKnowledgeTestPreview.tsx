import Input from '@app/components/Input';
import type KnowledgeTestQuestion from '@app/models/KnowledgeTestQuestion';

type GlobalKnowledgeTestPreviewProps = {
  questions: KnowledgeTestQuestion[];
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GlobalKnowledgeTestPreview({
  questions,
  translations,
}: GlobalKnowledgeTestPreviewProps) {
  return (
    <div className="flex flex-col space-y-6">
      {questions.map((question) => (
        <div key={question.question} className="flex flex-col">
          <div className="my-2 text-xl font-bold">{question.question}</div>
          <div>
            <Input
              label="answer-preview"
              name="answer-preview"
              placeholder={translations('Lessons.answer')}
            />
          </div>
          <div>{translations('Lessons.correct-answer')}</div>
          <div>{question.answer}</div>
        </div>
      ))}
    </div>
  );
}
