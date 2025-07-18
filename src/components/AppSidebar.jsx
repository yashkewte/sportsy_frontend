'use client'
import { Calendar, Home, ChevronUp, User2 } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebaseConfig'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CgProfile } from "react-icons/cg";
import { auth } from "@/firebase/firebaseConfig"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
  SidebarFooter,


} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Events",
    url: "/all-events",
    icon: Calendar,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: CgProfile,
  },

]

function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter()

  const handleLogout = async ()=>{
    try {
      await auth.signOut()
      router.push('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Error logging out: ' + error.message)
      console.log(error.message);
      
    }
  }

  const handleAccount = ()=>{
    router.push('/profile')
  }

  useEffect(() => {
    const fetchFullName = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFullName(docSnap.data().fullName || 'User');
        } else {
          setFullName('User');
        }
      } else {
        setFullName('User');
      }
      setLoading(false);
    };
    fetchFullName();
  }, [user]);

  useEffect(() => { setMounted(true); }, []);

  // Pages where sidebar should be hidden
  const hiddenPages = ['/login', '/signup', '/about', '/forgot_password', '/'];

  // Don't render sidebar on hidden pages
  if (hiddenPages.includes(pathname)) {
    return null;
  }

  if (!mounted || loading) {
    return <span className="animate-pulse bg-gray-200 rounded w-32 h-8 inline-block" />;
  }

  return (
    <div>
      <Sidebar collapsible="icon" variant="default">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <span className='flex items-center gap-2'>
                  {loading ? (
                    <span className="animate-pulse bg-gray-200 rounded-full w-8 h-8 inline-block" />
                  ) : (
                    <>
                      <Avatar>
                        <AvatarFallback>
                          {fullName
                            ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className='font-bold text-lg'>
                        {fullName}
                      </span>
                    </>
                  )}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator className='p-0 m-0' />
        <SidebarContent>
          <SidebarGroup>

            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> {fullName} <ChevronUp className='ml-auto' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-24'>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAccount}>Account</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}

export default AppSidebar
