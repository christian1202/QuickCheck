import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { UserProfile } from "../../types";

// Same validation schema as AddMember
const memberSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  birthdate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid birthdate" }),
  baptismDate: z.string().optional(),
  duty: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  email: z.string().email().optional().or(z.literal('')),
});

type MemberFormInputs = z.infer<typeof memberSchema>;

export default function EditMember() {
  const { id } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    setValue, // Used to pre-fill the form
    formState: { errors, isSubmitting },
  } = useForm<MemberFormInputs>({
    resolver: zodResolver(memberSchema),
  });

  // 1. Fetch User Data on Load
  useEffect(() => {
    async function fetchUser() {
      if (!id) return;
      try {
        const docRef = doc(db, "users", id);
        const snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          // Pre-fill the form fields
          setValue("fullName", data.fullName || "");
          setValue("birthdate", data.birthdate || "");
          setValue("baptismDate", data.baptismDate || ""); // 👈 Fixed
          setValue("duty", data.duty || "");               // 👈 Fixed
          setValue("status", data.status || "Regular");    // 👈 Fixed
          setValue("email", data.email || "");             // 👈 Fixed
        } else {
          alert("Member not found!");
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Error fetching member:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id, setValue, navigate]);

  // 2. Handle Update
  const onSubmit = async (data: MemberFormInputs) => {
    if (!id) return;
    try {
      const docRef = doc(db, "users", id);
      await updateDoc(docRef, {
        ...data,
        // We don't update createdAt or role usually
      });
      
      alert("Member updated successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error updating member:", error);
      alert("Failed to update member");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading member data...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Member Profile</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            {...register("fullName")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Birthdate</label>
            <input
              type="date"
              {...register("birthdate")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Baptism Date</label>
            <input
              type="date"
              {...register("baptismDate")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duty / Ministry</label>
            <input
              {...register("duty")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <input
              {...register("status")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            {isSubmitting ? "Saving Changes..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}