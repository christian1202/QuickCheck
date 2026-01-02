import type { AppEvent } from "../../../types";

interface Props {
  date: string;
  availableEvents: AppEvent[];
  selectedEvent: AppEvent | null;
  onSelect: (event: AppEvent) => void;
}

export function EventSelector({ date, availableEvents, selectedEvent, onSelect }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {availableEvents.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">😴</div>
          <h3 className="text-lg font-bold text-gray-700">No Scheduled Events</h3>
          <p className="text-gray-500 text-sm">
            There are no recurring or one-time events scheduled for {date}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Select Event for {date}:
          </label>
          <div className="flex flex-wrap gap-3">
            {availableEvents.map(ev => (
              <button
                key={ev.id}
                onClick={() => onSelect(ev)}
                className={`px-4 py-3 rounded-lg border text-left transition-all ${
                  selectedEvent?.id === ev.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="font-bold">{ev.title}</div>
                <div className="text-xs opacity-90 mt-1">
                  {ev.batches && ev.batches.length > 0 
                    ? ev.batches.join(", ") 
                    : "Standard Time"}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}