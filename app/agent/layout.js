import Header from "@/components/Header";
import { AuthProvider } from "@/lib/AuthContext";

export default function AgentLayout({ children }) {
  return (
    <AuthProvider>
      <Header />
      <div className="w-full p-4 sm:p-6 bg-gray-50">
        {children}
      </div>
    </AuthProvider>
  );
}