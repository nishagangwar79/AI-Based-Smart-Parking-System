import { Car, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Smart Parking</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              AI-powered smart parking system for Delhi NCR. Find, book, and manage parking slots with intelligent recommendations and demand predictions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/parking" className="hover:text-white transition-colors">Find Parking</Link></li>
              <li><Link to="/ai-recommendation" className="hover:text-white transition-colors">AI Recommendations</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> support@smartparking.com</li>
              <li className="flex items-center"><Globe className="w-4 h-4 mr-2" /> Portfolio Project</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} AI-Based Smart Parking System. Built with MERN Stack.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
