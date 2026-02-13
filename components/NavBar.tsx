'use client';

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const ThemeToggle = dynamic(() => import('./ThemeToggle'), {
  ssr: false,
  loading: () => <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 w-9 h-9" />,
});

const NavBar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 shadow-lg mb-12 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="w-16 h-16 mr-3">
                {/* Replace with your actual logo */}
                <Image
                  src="/logo.png"
                  alt="NewsHub Logo"
                  width={64}
                  height={64}
                  className="rounded-full shadow-md"
                />
              </div>
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                NewsHub
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  href="/" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Home
                </Link>
                <Link 
                  href="/categories" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Categories
                </Link>
                <Link 
                  href="/about" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search news..."
              className="hidden md:block px-4 py-2 rounded-md text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
