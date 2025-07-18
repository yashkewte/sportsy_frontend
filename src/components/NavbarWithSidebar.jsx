"use client"
import React from 'react'
import { MdOutlineSportsBasketball } from "react-icons/md";
import ThemeToggle from './ThemeToggle';
import { SidebarTrigger } from './ui/sidebar';
import { useAuth } from '@/context/AuthContext'

function NavbarWithSidebar() {
    const {user} = useAuth()

    return (
        <nav className='flex items-center justify-between w-full h-fit p-2 lg:p-4  border-b-2 shadow-md'>
            <div className='flex items-center justify-around w-full '>
                {
                    user? <SidebarTrigger/>: null
                }
                
                <div className='flex items-center justify-between w-full mx-0 lg:mx-10'>
                    <div className='flex items-center justify-center '>
                        <h1 className='flex items-center justify-center gap-2 font-bold text-primary text-xl border-r-2 pr-4'><MdOutlineSportsBasketball />Sportsy</h1>
                        <p className='ml-2 text-md text-muted-foreground'>Never Miss a Game Again.</p>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}

export default NavbarWithSidebar 