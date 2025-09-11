interface StatRowProps {
  id?: number;
  label: string;
  value: number | string;
}

export default function StatRow({ id, label, value }: StatRowProps) {
  return (
    <div className="w-full flex items-baseline text-fluid-sm">
      <span className={id === 0 ? 'text-white/50' : 'text-white'}>{label}</span>
      <span className="flex-1 border-b border-dotted mx-2"></span>
      <span className="font-sans">{value}</span>
    </div>
  );
}
