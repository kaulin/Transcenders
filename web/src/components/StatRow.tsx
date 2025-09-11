interface StatRowProps {
  label: string;
  value: number | string;
}

export default function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="w-full flex items-baseline text-fluid-sm">
      <span>{label}</span>
      <span className="flex-1 border-b border-dotted mx-2"></span>
      <span className="font-sans">{value}</span>
    </div>
  );
}
