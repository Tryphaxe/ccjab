import Header from "@/components/Header";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { internalFont } from '@/lib/fonts';

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <div className={internalFont.className}>
        <Header />
        <div className="w-full bg-[#fcf8fb] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <ProtectedRoute allowedRoles={['ADMIN', 'ASSISTANT']}>
            {children}
          </ProtectedRoute>
        </div>
      </div>
    </AuthProvider>
  );
}
