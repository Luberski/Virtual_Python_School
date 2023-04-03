type KnowledgeTestFormCardProps = {
  children: React.ReactNode;
};

export default function KnowledgeTestFormCard({
  children,
}: KnowledgeTestFormCardProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {children}
    </div>
  );
}
