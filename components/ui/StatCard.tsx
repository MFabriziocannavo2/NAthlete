export default function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
