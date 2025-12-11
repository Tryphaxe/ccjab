import Header from "@/components/Header";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedRoute from "@/lib/ProtectedRoute";

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <Header />
      <div className="w-full p-4 sm:p-6 bg-gray-50">
        <ProtectedRoute allowedRoles={['ADMIN']}>
          {children}
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}