import { type UseFormRegister,type FieldError,type Path,type FieldValues } from "react-hook-form";

// 👇 Generic Interface: T represents "Any Form Data"
interface FormFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>; // This ensures 'name' must exist in your form schema
  register: UseFormRegister<T>;
  error?: FieldError;
  type?: string;
  placeholder?: string;
  className?: string;
  labelClass?: string;
}

export function FormInput<T extends FieldValues>({ 
  label, name, register, error, type = "text", placeholder, className = "", labelClass = "text-gray-700" 
}: FormFieldProps<T>) {
  return (
    <div>
      <label className={`block text-sm font-medium ${labelClass}`}>{label}</label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors ${className}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}

// You can create a Select component here too, or keep it specific if options change often.
export function FormSelect<T extends FieldValues>({ 
  label, name, register, error, children 
}: FormFieldProps<T> & { children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        {...register(name)}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}