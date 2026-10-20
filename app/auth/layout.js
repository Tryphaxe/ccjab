import { AuthProvider } from "@/lib/AuthContext";

export default function AuthLayout({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
