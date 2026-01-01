import { Trash2, Edit } from "lucide-react"; // Import Edit icon if missing
import { calculateAge, getUserCategory } from "../../lib/utils"; 
import type { UserProfile } from "../../types"; 

interface UsersTableProps {
  users: UserProfile[];
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white border border-gray-100 rounded-xl">
        No members found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700">Member List</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Age</th>
              <th className="px-6 py-3 font-medium">Category</th>
              {/* 👇 ADDED DUTY COLUMN HERE */}
              <th className="px-6 py-3 font-medium">Duty</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const age = calculateAge(user.birthdate);
              const category = getUserCategory(age);
              
              return (
                <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-4 text-gray-600">{age !== null ? age : "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      category === 'Senior' ? 'bg-purple-100 text-purple-700' : 
                      category === 'Junior' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category}
                    </span>
                  </td>
                  {/* 👇 ADDED DUTY DATA HERE */}
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {user.duty ? (
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs border border-blue-100">
                        {user.duty}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     {/* Reuse your Badge logic here or assume StatusBadge component exists */}
                     <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {user.status || "Active"}
                     </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button onClick={() => onEdit(user.uid)} className="text-blue-600 hover:text-blue-900">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => onDelete(user.uid, user.fullName)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}