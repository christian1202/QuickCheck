import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { AdminService } from "../../services/adminService";

// 1. Validation Rules (The "Anti-Spaghetti" Logic)
const eventSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  // 👇 FIX: Added lateThreshold to the schema so react-hook-form can track it
  lateThreshold: z.string().min(1, { message: "Late threshold time is required" }), 
  type: z.enum(["service", "meeting", "special"]), 
});

// 👇 FIX: The type is now inferred correctly from the updated schema
type EventFormInputs = z.infer<typeof eventSchema>;

export default function CreateEvent() {
  const navigate = useNavigate();


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
    // 👇 FIX: Added a default value for the field here
    defaultValues: {
      lateThreshold: "09:00" 
    }
  });

  const onSubmit = async (data: EventFormInputs) => {
    try {
      // Create the event in Firebase
      await AdminService.createEvent({
        ...data,
        isActive: true, // Auto-activate new events
      });
      alert("Event created successfully!");
      navigate("/admin/events"); // Go back to manage events
    } catch (error) {
      // 👇 FIX: Logged error to satisfy "unused variable" linter
      console.error(error);
      alert("Failed to create event");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Title</label>
          <input
            {...register("title")}
            placeholder="e.g. Wednesday Prayer Meeting"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            {...register("date")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
        </div>

        {/* Time Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              {...register("startTime")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-red-600 mb-1">
              Mark as "Late" After:
            </label>
            <input 
              type="time" 
              {...register("lateThreshold")} 
              className="mt-1 block w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1 italic">
              Students who check in after this time will be tagged as Late.
            </p>
            {errors.lateThreshold && (
              <p className="text-red-500 text-sm mt-1">{errors.lateThreshold.message}</p>
            )}
          </div>
        </div>

        {/* Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Type</label>
          <select
            {...register("type")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a type...</option>
            <option value="service">Sunday Service</option>
            <option value="meeting">Prayer Meeting</option>
            <option value="special">Special Event</option>
          </select>
          {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
        </div>

        {/* End Time (Added back to ensure logic completeness) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="time"
            {...register("endTime")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}