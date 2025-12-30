import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

// 1. Validation Schema
const memberSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  birthdate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid birthdate" }),
  duty: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')), // Optional email
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
  });

  const onSubmit = async (data: MemberFormInputs) => {
    try {
      // Save to 'users' collection
      await addDoc(collection(db, "users"), {
        ...data,
        createdAt: new Date().toISOString(),
        role: 'student' // Default role
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

        {/* Birthdate (Crucial for Senior/Junior Logic) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Birthdate</label>
          <input
            type="date"
            {...register("birthdate")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate.message}</p>}
        </div>

        {/* Duty / Ministry */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Ministry / Duty (Optional)</label>
          <select
            {...register("duty")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            <option value="Music Team">Music Team</option>
            <option value="Usher">Usher</option>
            <option value="Multimedia">Multimedia</option>
            <option value="Kids Ministry">Kids Ministry</option>
          </select>
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