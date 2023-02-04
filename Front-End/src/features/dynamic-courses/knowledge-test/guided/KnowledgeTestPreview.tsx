import Input from '@app/components/Input';
import type KnowledgeTestQuestion from '@app/models/KnowledgeTestQuestion';
import { parseMarkdown } from '@app/utils';

type KnowledgeTestPreviewProps = {
  questions: KnowledgeTestQuestion[];
  translations: (key: string, ...params: unknown[]) => string;
};

export default function KnowledgeTestPreview({
  questions,
  translations,
}: KnowledgeTestPreviewProps) {
  return (
    <div className="flex flex-col space-y-6">
      {questions.map((question) => (
        <div key={question.question} className="flex flex-col">
          <div
            className="markdown overflow-auto whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(question?.question),
            }}
          />
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
