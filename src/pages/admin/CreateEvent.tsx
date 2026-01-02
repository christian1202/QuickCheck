import { useState } from "react";
import { useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { AdminService } from "../../services/adminService";
import { EventRepeater } from "../../components/admin/EventRepeater";
import type { RecurrenceData } from "../../components/admin/EventRepeater";
import type { AppEvent } from "../../types"; // Import AppEvent for casting
import { FormInput, FormSelect } from "../../components/ui/FormFields";
import { eventSchema, type EventFormInputs } from "../../lib/schemas";



// --- 2. MAIN COMPONENT ---
export default function CreateEvent() {
  const navigate = useNavigate();
  const [recurrence, setRecurrence] = useState<RecurrenceData>({ type: 'none', days: [] });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
    defaultValues: { lateThreshold: "09:00" }
  });

  // --- 3. LOGIC HANDLER ---
  const onSubmit = async (data: EventFormInputs) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to create an event.");
      return;
    }

    try {
      // 👇 FIX: Explicitly cast the payload to Partial<AppEvent>
      // This tells TS: "Trust me, I know 'daily' is valid now."
      const eventPayload: Partial<AppEvent> = {
        ...data,
        isActive: true,
        recurrence: recurrence.type === 'none' ? undefined : {
          frequency: recurrence.type as 'weekly' | 'daily',
          days: recurrence.days
        }
      };

      await AdminService.createEvent(eventPayload, user);

      alert("Event created successfully!");
      navigate("/admin/events"); 
    } catch (error) {
      console.error("Create event failed:", error);
      alert("Failed to create event. Check console.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 animate-in fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* REUSABLE INPUTS */}
        <FormInput label="Event Title" name="title" register={register} error={errors.title} placeholder="e.g. Wednesday Prayer Meeting" />
        
        <FormInput label="Date" name="date" type="date" register={register} error={errors.date} />

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Start Time" name="startTime" type="time" register={register} error={errors.startTime} />
          
          <div>
            <FormInput 
              label="Mark 'Late' After" 
              name="lateThreshold" 
              type="time" 
              register={register} 
              error={errors.lateThreshold} 
              className="border-red-200 bg-red-50 focus:ring-red-500"
              labelClass="text-red-600"
            />
            <p className="text-xs text-gray-500 mt-1 italic">Late check-in threshold.</p>
          </div>
        </div>

        {/* Note: I updated FormSelect to accept children for flexibility */}
        <FormSelect label="Event Type" name="type" register={register} error={errors.type}>
            <option value="">Select a type...</option>
            <option value="service">Sunday Service</option>
            <option value="meeting">Prayer Meeting</option>
            <option value="special">Special Event</option>
        </FormSelect>

        <FormInput label="End Time" name="endTime" type="time" register={register} error={errors.endTime} />

        <div className="pt-4 border-t border-gray-100">
           <EventRepeater value={recurrence} onChange={setRecurrence} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 mt-4"
        >
          {isSubmitting ? "Creating Schedule..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}