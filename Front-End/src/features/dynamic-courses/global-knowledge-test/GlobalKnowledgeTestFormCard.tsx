type GlobalKnowledgeTestFormCardProps = {
  children: React.ReactNode;
};

export default function GlobalKnowledgeTestFormCard({
  children,
}: GlobalKnowledgeTestFormCardProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {children}
    </div>
  );
}
