import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  scope: 'global' | 'local';
  userCount: number;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onNavigate: (direction: number) => void;
}

export function AttendanceHeader({ scope, userCount, selectedDate, onDateChange, onNavigate }: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {scope === 'global' ? "🌍 Global Report" : "📍 Local Report"}
        </h1>
        <p className="text-sm text-gray-500">
          {scope === 'global' ? "System-wide records" : `Managing ${userCount} local members`}
        </p>
      </div>

      <div className="flex items-center gap-2 bg-white p-1 border rounded-lg shadow-sm">
        <button onClick={() => onNavigate(-1)} className="p-2 hover:bg-gray-100 rounded">
          <ChevronLeft size={20}/>
        </button>
        
        <div className="relative">
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => onDateChange(e.target.value)}
            className="pl-9 pr-2 py-1 outline-none font-semibold text-gray-700 bg-transparent"
          />
          <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"/>
        </div>

        <button onClick={() => onNavigate(1)} className="p-2 hover:bg-gray-100 rounded">
          <ChevronRight size={20}/>
        </button>
      </div>
    </div>
  );
}