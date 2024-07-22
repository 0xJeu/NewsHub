import Link from "next/link";
import Image from "next/image";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-gray-100 to-gray-300 text-gray-800 shadow-lg mb-12">
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
              <span className="text-3xl font-extrabold text-gray-900">
                NewsHub
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="nav-link">
                  Home
                </Link>
                <Link href="/categories" className="nav-link">
                  Categories
                </Link>
                <Link href="/about" className="nav-link">
                  About
                </Link>
                <Link href="/contact" className="nav-link">
                  Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search news..."
              className="px-3 py-1 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
