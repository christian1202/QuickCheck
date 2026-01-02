import React from "react";

// The shape of the data we give back to the parent form
export interface RecurrenceData {
  type: 'none' | 'daily' | 'weekly';
  days: number[]; // 0=Sun, 1=Mon, etc.
}

interface Props {
  value: RecurrenceData;
  onChange: (val: RecurrenceData) => void;
}

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export function EventRepeater({ value, onChange }: Props) {
  
  // 1. Handle Type Change (One-time vs Daily vs Weekly)
  const handleTypeChange = (newType: 'none' | 'daily' | 'weekly') => {
    if (newType === 'none') {
      onChange({ type: 'none', days: [] });
    } else if (newType === 'daily') {
      // 🚀 OPTIMIZATION: "Daily" means "All 7 Days"
      onChange({ type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] });
    } else {
      // Default to today if they switch to weekly
      const today = new Date().getDay();
      onChange({ type: 'weekly', days: [today] });
    }
  };

  // 2. Handle Specific Day Toggles (for Weekly)
  const toggleDay = (dayIndex: number) => {
    const currentDays = value.days;
    const isSelected = currentDays.includes(dayIndex);
    
    let newDays;
    if (isSelected) {
      newDays = currentDays.filter(d => d !== dayIndex); // Remove
    } else {
      newDays = [...currentDays, dayIndex].sort(); // Add & Sort
    }

    // Prevent deselecting the last day (must have at least one)
    if (newDays.length === 0) return;

    onChange({ ...value, days: newDays });
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <label className="block text-sm font-semibold text-gray-700">Frequency</label>
      
      {/* FREQUENCY BUTTONS */}
      <div className="flex gap-2">
        {(['none', 'daily', 'weekly'] as const).map((type) => (
          <button
            key={type}
            type="button" // Prevent submitting form
            onClick={() => handleTypeChange(type)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
              value.type === type
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {type === 'none' ? 'One-time' : type === 'daily' ? 'Every Day' : 'Weekly'}
          </button>
        ))}
      </div>

      {/* WEEKLY SELECTOR (Only show if Weekly) */}
      {value.type === 'weekly' && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <p className="text-xs text-gray-500 mb-2">Repeat on which days?</p>
          <div className="flex justify-between gap-1">
            {DAYS.map((day) => {
              const isActive = value.days.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {day.label[0]} {/* S, M, T... */}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-blue-600 mt-2 text-center font-medium">
             Repeats every {value.days.map(d => DAYS[d].label).join(", ")}
          </p>
        </div>
      )}

      {/* DAILY MESSAGE */}
      {value.type === 'daily' && (
        <p className="text-xs text-center text-green-600 font-medium animate-in fade-in">
          ✅ Event will appear automatically every single day.
        </p>
      )}
    </div>
  );
}