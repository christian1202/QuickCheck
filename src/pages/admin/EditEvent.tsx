import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminService } from "../../services/adminService";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

// 👇 Import Shared Logic & Components
import { eventSchema,type EventFormInputs } from "../../lib/schemas";
import { FormInput, FormSelect } from "../../components/ui/FormFields";
import { EventRepeater } from "../../components/admin/EventRepeater";
import type { RecurrenceData } from "../../components/admin/EventRepeater";
import type { AppEvent } from "../../types";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Repeater State (Separate from form because it's a complex object)
  const [recurrence, setRecurrence] = useState<RecurrenceData>({ type: 'none', days: [] });

  // 1. Setup Form with Shared Schema
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
  });

  // 2. Load Data on Mount
  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;
    try {
      const event = await AdminService.getEventById(id);
      if (event) {
        // Populate the Form
        reset({
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          lateThreshold: event.lateThreshold || "09:00", // Fallback if missing
          type: event.type as "service" | "meeting" | "special", // Cast to satisfy enum
        });

        // Populate the Repeater
        if (event.recurrence) {
          setRecurrence({
            type: event.recurrence.frequency,
            days: event.recurrence.days
          });
        }
      }
    } catch (error) {
      console.error("Failed to load event", error);
      alert("Error loading event details");
      navigate("/admin/events");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Update
  const handleUpdate = async (data: EventFormInputs) => {
    if (!id) return;

    try {
      // Construct Payload (Same logic as Create)
      const payload: Partial<AppEvent> = {
        ...data,
        recurrence: recurrence.type === 'none' ? undefined : {
          frequency: recurrence.type as 'weekly' | 'daily',
          days: recurrence.days
        }
      };

      await AdminService.updateEvent(id, payload);
      
      alert("✅ Event Updated Successfully!");
      navigate("/admin/events");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update event");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading Event Details...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
         <button 
          onClick={() => navigate("/admin/events")}
          className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Schedule
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>

        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
          
          {/* REUSABLE COMPONENTS */}
          <FormInput label="Event Title" name="title" register={register} error={errors.title} />
          
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
            </div>
          </div>

          <FormSelect label="Event Type" name="type" register={register} error={errors.type}>
             <option value="service">Church Service</option>
             <option value="meeting">Prayer Meeting</option>
             <option value="special">Special Event</option>
          </FormSelect>

          <FormInput label="End Time" name="endTime" type="time" register={register} error={errors.endTime} />

          {/* REPEATER LOGIC */}
          <div className="pt-4 border-t border-gray-100">
             <EventRepeater value={recurrence} onChange={setRecurrence} />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all mt-6 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Saving Changes...</>
            ) : (
              <>
                <Save size={20} /> Save Changes
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}