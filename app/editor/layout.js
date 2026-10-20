import Header from "@/components/Header";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { internalFont } from '@/lib/fonts';

export default function EditorLayout({ children }) {
  return (
    <AuthProvider>
      <div className={internalFont.className}>
        <ProtectedRoute allowedRoles={['EDITEUR']}>
          <Header />
          <div className="w-full bg-gray-50 p-4 sm:p-6">
            {children}
          </div>
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}
