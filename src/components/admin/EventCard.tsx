import { Trash2, Calendar, Clock, MapPin, Edit, Globe, Map } from "lucide-react";
import type { AppEvent } from "../../types";

interface EventCardProps {
  event: AppEvent;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  canModify: boolean; // Only allow edit/delete if they own the event
}

export function EventCard({ event, onEdit, onDelete, canModify }: EventCardProps) {
  const isGlobal = event.scope === 'global';

  return (
    <div className={`relative bg-white p-6 rounded-xl shadow-sm border transition-shadow hover:shadow-md ${isGlobal ? 'border-blue-100' : 'border-gray-200'}`}>
      
      {/* 1. SCOPE BADGE (The visual indicator) */}
      <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl rounded-tr-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
        isGlobal ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
      }`}>
        {isGlobal ? <Globe size={10} /> : <Map size={10} />}
        {isGlobal ? 'Global Event' : 'Local Event'}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 mt-2">
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
          event.type === 'service' ? 'bg-blue-100 text-blue-700' : 
          event.type === 'meeting' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {event.type}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 pr-16">{event.title}</h3>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>{event.startTime} - {event.endTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <span>Main Sanctuary</span> 
        </div>
      </div>

      {/* Buttons - Only show if user has permission */}
      {canModify && (
        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
          <button 
            onClick={() => onEdit(event.id)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => onDelete(event.id, event.title)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}