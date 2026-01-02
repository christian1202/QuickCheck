import * as z from "zod";

// Shared Validation Logic
export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  lateThreshold: z.string().min(1, "Late threshold is required"),
  type: z.enum(["service", "meeting", "special"]), 
});



// Export the Type so we can use it in components
export type EventFormInputs = z.infer<typeof eventSchema>;