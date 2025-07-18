'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
   
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';



export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

   

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!email || !password) {
                toast.error('Please fill in all fields');
                return false;
            }
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
            toast.success('Login successful!');
            

            return true;
        } catch (err) {
            toast.error(err.message);
            console.log(err.message);

        }
        finally{
            setLoading(false);
        }
        // toast.error('Login failed. Please check your credentials.');

    };

    return (
        <div className='flex flex-col min-h-screen'>
            
            <div className='flex items-center justify-center h-screen mx-2'>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Login to your account</CardTitle>
                        <CardDescription>
                            Enter your email below to login to your account
                        </CardDescription>
                        <CardAction>
                            <Button variant="link" onClick={() => router.push('/signup')}>Sign Up</Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}

                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="/forgot_password"
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <div className='relative'>
                                        <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={!password}
                                            tabIndex={-1}
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </Button>
                                    </div>
                                </div>
                                <div className="flex-col gap-2">
                                    <Button type='submit' className="w-full" disabled={loading}>
                                        {loading ? 'Logging in...' : 'Login'}
                                    </Button>
                                    {/* <Button variant="outline" className="w-full">
                                        Login with Google
                                    </Button> */}
                                </div>
                            </div>
                        </form>
                    </CardContent>

                </Card>
            </div>
        </div>
    );
}
