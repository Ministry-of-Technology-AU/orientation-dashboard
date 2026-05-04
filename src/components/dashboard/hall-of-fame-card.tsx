interface HallEntry {
  name: string;
  points: number;
}

export function HallOfFameCard({ entries }: { entries: HallEntry[] }) {
  return (
    <div className="bg-white rounded-2xl p-4">
      <h3 className="text-base font-semibold text-gray-800 mb-2">Hall of Fame</h3>
      <div className="border-t border-gray-200">
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-gray-100"
          >
            <span className="text-sm text-gray-700">{entry.name}</span>
            <span className="text-sm font-medium text-gray-700">{entry.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
