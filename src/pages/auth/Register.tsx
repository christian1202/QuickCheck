import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { AuthService } from "../../services/authService";
import { UserPlus } from "lucide-react";

// 1. Validation for the new Secretary
const registerSchema = z.object({
  fullName: z.string().min(3, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  birthdate: z.string().min(1, "Birthdate is required"),
});

type RegisterInputs = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema)
  });

 // Inside Register.tsx
    const onSubmit = async (data: RegisterInputs) => {
    try {
        await AuthService.registerSecretary(data);
        alert("✅ Secretary Account Created! You can now log in.");
        navigate("/login");
    } catch (error: unknown) { // Change 'any' to 'unknown'
        const message = error instanceof Error ? error.message : "Registration failed";
        console.error(message);
        alert(message);
    }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Secretary Sign Up</h2>
          <p className="mt-2 text-sm text-gray-600">Create an account to help manage attendance</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input {...register("fullName")} className="mt-1 block w-full border rounded-md p-2" placeholder="Secretary Name" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" {...register("email")} className="mt-1 block w-full border rounded-md p-2" placeholder="email@church.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Birthdate</label>
            <input type="date" {...register("birthdate")} className="mt-1 block w-full border rounded-md p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" {...register("password")} className="mt-1 block w-full border rounded-md p-2" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Secretary Account"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}