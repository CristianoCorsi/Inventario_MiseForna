import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileOpen={mobileMenuOpen} 
        toggleMobileMenu={toggleMobileMenu} 
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
