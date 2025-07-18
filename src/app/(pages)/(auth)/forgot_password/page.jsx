'use client'
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { toast } from 'sonner';
import React from 'react'
import { GoArrowLeft } from "react-icons/go";
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

function page() {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const router = useRouter();

    const handleReset = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email');
        setSending(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent!');
            setEmail('');
            router.push('/login');
        } catch (error) {
            toast.error('Failed to send password reset email. Please try again.');
            console.error('Error sending password reset email:', error);
        }
        finally {
            setSending(false);
        }

    }
    return (
        <div className='flex flex-col min-h-screen p-2'>
            {/* header */}
            <div className='relative flex justify-between items-center mt-4 pt-4'>
                <GoArrowLeft size={24} onClick={() => router.push('/login')} className='cursor-pointer' />
                <h1 className='text-primary font-bold text-xl lg:text-3xl absolute left-1/2 transform -translate-x-1/2'>Forgot Password</h1>
                
            </div>
            {/* body */}
            <div className='flex items-center justify-center h-screen mx-2'>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Enter your email</CardTitle>
                        <CardDescription>
                            We'll send you a link to reset your password.
                        </CardDescription>

                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleReset}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full cursor-pointer">
                                    {sending ? 'Sending...' : 'Send'}
                                </Button>
                                <p className="text-sm text-gray-500 mt-2">
                                    If you don’t see the email, please check your spam or promotions folder.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default page
