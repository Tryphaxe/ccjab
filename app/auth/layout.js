import { AuthProvider } from "@/lib/AuthContext";

export default function AuthLayout({ children }) {
    return (
        <AuthProvider>
            <div className="w-full h-[100vh] p-4 sm:p-6 flex items-center justify-center">
                {children}
            </div>
        </AuthProvider>
    );
}