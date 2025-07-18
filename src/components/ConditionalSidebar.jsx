'use client'
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";
import NavbarWithSidebar from "./NavbarWithSidebar";

// Pages where sidebar should be completely hidden (no provider, no trigger)
const hiddenPages = ['/login', '/signup', '/about', '/forgot_password', '/'];

function ConditionalSidebar({ children }) {
  const pathname = usePathname();
  
  // Don't render sidebar infrastructure on hidden pages
  if (hiddenPages.includes(pathname)) {
    return (
      <main className="w-full">
        <Navbar />
        {children}
      </main>
    );
  }

  // Render sidebar infrastructure on other pages
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <NavbarWithSidebar />
        {children}
      </main>
    </SidebarProvider>
  );
}

export default ConditionalSidebar; 