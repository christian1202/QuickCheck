import type { UserProfile } from "../../types";

interface Props {
  secretaries: UserProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SecretarySelector({ secretaries, selectedId, onSelect }: Props) {
  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Filter View:
      </span>
      <select
        value={selectedId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
      >
        <option value="">🌍 All Members (Global)</option>
        <option disabled>──────────</option>
        {secretaries.map((sec) => (
          <option key={sec.uid} value={sec.uid}>
            👤 {sec.fullName}
          </option>
        ))}
      </select>
    </div>
  );
}