'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function SuccessCheckmark() {
  // Simple animated checkmark
  return (
    <svg className="mx-auto mb-2 animate-bounce" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#4ade80" fillOpacity="0.2"/>
      <path d="M16 24L22 30L32 18" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState({ fullName: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      toast.error('You need to login first')
      return
    }
    fetchProfile()
  }, [authLoading, user, router])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setProfile({ fullName: data.fullName || '', email: data.email || user.email || '' })
      } else {
        setProfile({ fullName: '', email: user.email || '' })
      }
    } catch (error) {
      toast.error('Error fetching profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setSuccess(false)
    try {
      const docRef = doc(db, 'users', user.uid)
      await updateDoc(docRef, {
        fullName: profile.fullName,
        email: profile.email
      })
      setSuccess(true)
      toast.success('Profile updated successfully!')
      setTimeout(() => setSuccess(false), 2000)
    } catch (error) {
      toast.error('Error updating profile: ' + error.message)
      console.log(error.message);
      
    } finally {
      setUpdating(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Loading profile...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-transform hover:scale-[1.02]">
        <CardHeader className="relative bg-gradient-to-r from-blue-100/60 via-purple-100/40 to-transparent dark:from-blue-900/40 dark:via-purple-900/30 dark:to-transparent rounded-t-xl pb-4 mb-2">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-20 h-20 shadow-lg border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-purple-400 text-3xl font-bold flex items-center justify-center">
              <AvatarFallback className="text-3xl font-bold">
                {profile.fullName ? profile.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hello, {profile.fullName || 'User'}
            </CardTitle>
            <CardDescription className="text-center text-base text-muted-foreground">
              Update your name and email address
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                required
                className="transition-shadow focus:shadow-outline focus:ring-2 focus:ring-blue-400"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                required
                className="transition-shadow focus:shadow-outline focus:ring-2 focus:ring-purple-400"
                autoComplete="off"
              />
            </div>
            <Button
              type="submit"
              className="w-full font-semibold py-2 transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 hover:scale-105 shadow-lg"
              disabled={updating}
            >
              {updating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Updating...
                </span>
              ) : (
                'Update Profile'
              )}
            </Button>
            {success && (
              <div className="flex flex-col items-center mt-2">
                <SuccessCheckmark />
                <span className="text-green-600 font-medium animate-fade-in">Profile updated!</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage 