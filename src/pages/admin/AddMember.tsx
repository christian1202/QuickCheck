import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

// 1. Validation Rules
const memberSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  birthdate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid birthdate" }),
  
  // NEW: Baptism Date (Optional, because new converts might not be baptized yet)
  baptismDate: z.string().optional(),

  // UPDATED: Duty is now just a string (Free text), optional
  duty: z.string().optional(),

  // NEW: Status is free text (e.g., "Regular", "Visitor", "Backslider")
  status: z.string().min(1, "Status is required"),

  email: z.string().email().optional().or(z.literal('')),
});

type MemberFormInputs = z.infer<typeof memberSchema>;

export default function AddMember() {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormInputs>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      status: "Regular" // Default value to save time
    }
  });

  const onSubmit = async (data: MemberFormInputs) => {
    try {
      await addDoc(collection(db, "users"), {
        ...data,
        createdAt: new Date().toISOString(),
        role: 'student' 
      });
      
      alert("Member added successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to add member");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Member</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            {...register("fullName")}
            placeholder="e.g. Juan Dela Cruz"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Date Row (Birthdate + Baptism) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Birthdate</label>
            <input
              type="date"
              {...register("birthdate")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate.message}</p>}
          </div>

          {/* NEW: Baptism Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Baptism Date (Optional)</label>
            <input
              type="date"
              {...register("baptismDate")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Info Row (Duty + Status) */}
        <div className="grid grid-cols-2 gap-4">
          {/* UPDATED: Duty (Free Text) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Duty / Ministry</label>
            <input
              {...register("duty")}
              placeholder="e.g. Music Team"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* NEW: Status (Free Text) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <input
              {...register("status")}
              placeholder="e.g. Regular, Visitor"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
             {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all"
        >
          {isSubmitting ? "Saving..." : "Add Member"}
        </button>
      </form>
    </div>
  );
}