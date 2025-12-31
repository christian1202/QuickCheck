import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthService } from "../../services/authService";
import { UserPlus } from "lucide-react";

const memberSchema = z.object({
  fullName: z.string().min(3, "Full Name is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  birthdate: z.string().min(1, "Birthdate is required"),
  duty: z.string().min(1, "Duty is required"),
});

type MemberInputs = z.infer<typeof memberSchema>;

// Inside RegisterMember.tsx
export default function RegisterMember({ currentSecretaryId }: { currentSecretaryId: string }) {
  // REMOVE 'errors' here to fix the "assigned a value but never used" error
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<MemberInputs>({
    resolver: zodResolver(memberSchema)
  });

  const onSubmit = async (data: MemberInputs) => {
    try {
      // Create the full object to satisfy the UserProfile type requirements
      const fullProfile = {
        ...data,
        role: 'student' as const,
        isNewlyBaptized: false,
        lateThreshold: "09:00",
        status: 'Active' as const
      };

      // This will now work because we added the function to AuthService
      await AuthService.registerMemberManual(fullProfile, currentSecretaryId);
      alert("✅ Member Registered Successfully!");
      reset(); 
    } catch (error) {
      console.error("Registration failed:", error); // Use 'error' to clear ESLint warning
    }
  };
  // ... rest of your HTML

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold">Manual Registration</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("fullName")} placeholder="Full Name" className="w-full border p-3 rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <input type="date" {...register("birthdate")} className="border p-3 rounded-lg" />
          <input {...register("duty")} placeholder="Duty (e.g. Choir)" className="border p-3 rounded-lg" />
        </div>
        <input {...register("email")} placeholder="Email (Optional)" className="w-full border p-3 rounded-lg" />
        
        <button disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
          {isSubmitting ? "Saving..." : "Register Member"}
        </button>
      </form>
    </div>
  );
}