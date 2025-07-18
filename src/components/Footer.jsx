
import { Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 px-4 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo or Brand */}
        <div className="text-lg font-semibold text-white">
          Sportsy © {new Date().getFullYear()}
        </div>

        {/* Navigation Links */}
        <div className="flex gap-6 text-sm">
          <Link href="/about" className="hover:text-white">About</Link>
         
        </div>

        {/* Social Icons */}
        <div className="flex gap-4">
          <a href="#" rel="noopener noreferrer">
            <Facebook className="w-5 h-5 hover:text-blue-500" />
          </a>
          <a href="#" rel="noopener noreferrer">
            <Twitter className="w-5 h-5 hover:text-sky-400" />
          </a>
          <a href="#" rel="noopener noreferrer">
            <Instagram className="w-5 h-5 hover:text-pink-500" />
          </a>
        </div>
      </div>
    </footer>
  );
}
