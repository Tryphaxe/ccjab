'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
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

            if (res.ok && user?.role === "ADMIN") {
                localStorage.setItem('user', JSON.stringify(user));
                toast.success('Connexion réussie 🎉');
                router.push('/dashboard/home');
            } else if (res.ok && user?.role === "AGENT") {
                localStorage.setItem('user', JSON.stringify(user));
                toast.success('Connexion réussie 🎉');
                router.push('/agent/home');
            } else {
                toast.error(user.error || 'Email ou mot de passe incorrect');
            }
        } catch (err) {
            toast.error('Erreur de connexion au serveur.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Connexion</CardTitle>
                <CardDescription className="text-md">
                    Entrez les informations de votre compte personnel
                </CardDescription>
                <CardAction>

                </CardAction>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Mot de passe</Label>
                            </div>
                            <Input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-2 mt-3">
                    <Button type="submit" variant="outline" className="bg-green-700 text-white">
                        {loading ? (<Loader2 className="h-4 w-4 animate-spin" />) : ""}
                        Se connecter
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
