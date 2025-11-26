'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const user = await res.json();

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(user));
                toast.success('Connexion réussie 🎉');
                
                // Redirection basée sur le rôle
                if (user?.role === "ADMIN") {
                    router.push('/dashboard/home');
                } else if (user?.role === "AGENT") {
                    router.push('/agent/home');
                } else {
                    // Fallback ou autre rôle
                    router.push('/dashboard/home');
                }
            } else {
                toast.error(user.error || 'Email ou mot de passe incorrect');
            }
        } catch (err) {
            toast.error('Erreur de connexion au serveur.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-sm shadow-xl border-gray-200 bg-white">
                <CardHeader className="space-y-2 text-center pb-6">
                    <div className="mx-auto w-20 h-20 relative mb-2">
                        <Image 
                            src="/images/favicon.png" 
                            alt="Logo CCJAB" 
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Connexion</CardTitle>
                    <CardDescription>
                        Entrez vos identifiants pour accéder à votre espace
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nom@exemple.com"
                                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mot de passe</Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Button 
                            type="submit" 
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold shadow-md transition-all duration-200"
                            disabled={loading}
                        >
                            {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Se connecter
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}