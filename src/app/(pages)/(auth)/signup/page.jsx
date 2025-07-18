'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { toast } from 'sonner';
import { doc, setDoc } from 'firebase/firestore';

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
import { Badge } from "@/components/ui/badge"
import { Shield, User } from 'lucide-react'


export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {

      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser
      console.log(user);

      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          fullName: fullName,
          email: email,
          role: selectedRole,
          createdAt: new Date(),
        });
      }
      router.push('/dashboard');
      toast.success('Welcome!');
    } catch (err) {
      toast.error('Error creating account: ' + err.message);
    }

  };


  return (
    <div>
      <div className='flex items-center justify-center h-screen'>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
            <CardAction>
              <Button variant="link" onClick={() => router.push('/login')}>Log In</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="m@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                
                {/* Role Selection */}
                <div className="grid gap-2">
                  <Label>Select your role</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                        selectedRole === 'user'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRole('user')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          selectedRole === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">User</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Join and create events
                          </div>
                        </div>
                      </div>
                      {selectedRole === 'user' && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          Selected
                        </Badge>
                      )}
                    </div>
                    
                    <div
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                        selectedRole === 'admin'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRole('admin')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          selectedRole === 'admin' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Admin</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Manage categories & cities
                          </div>
                        </div>
                      </div>
                      {selectedRole === 'admin' && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-col gap-2">
                  <Button type='submit' className="w-full">
                    Sign Up as {selectedRole === 'admin' ? 'Administrator' : 'User'}
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