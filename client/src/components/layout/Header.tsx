import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export default function Header({ toggleMobileMenu }: HeaderProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      return;
    }
    
    // We'll just show a toast for now, in real app this would navigate to search results
    toast({
      title: "Search not yet implemented",
      description: `You searched for: ${searchTerm}`,
    });
  };
  
  const handleScan = () => {
    toast({
      title: "QR Scan",
      description: "QR scanner functionality will be implemented soon.",
    });
  };
  
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
      <div className="flex items-center md:hidden">
        <button 
          className="text-gray-500 hover:text-gray-600"
          onClick={toggleMobileMenu}
        >
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <Link href="/" className="ml-3">
          <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 4.707a1 1 0 00-1.414-1.414L6 7.586l-.293-.293a1 1 0 00-1.414 1.414l1 1a1 1 0 001.414 0l3-3z" clipRule="evenodd"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full py-2 pl-10 pr-12 border border-gray-300 rounded-md bg-gray-50 focus:ring-secondary focus:border-secondary focus:outline-none sm:text-sm" 
            placeholder="Search inventory items..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button 
              type="button"
              onClick={handleScan}
              className="p-1 text-gray-400 hover:text-secondary" 
              title="Scan QR Code"
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
              </svg>
            </button>
          </div>
        </form>
      </div>
      
      <div className="flex items-center">
        <button className="p-1 text-gray-500 rounded-full hover:text-secondary hover:bg-gray-100">
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </button>
        <button className="flex items-center p-1 ml-3 text-gray-500 rounded-full hover:text-secondary hover:bg-gray-100">
          <img 
            className="w-8 h-8 rounded-full" 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="User profile" 
          />
        </button>
      </div>
    </header>
  );
}
