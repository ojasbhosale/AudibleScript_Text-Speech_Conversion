import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Mic,
  Speaker,
  ChevronDown,
  Library,
  LogOut,
  Menu,
  X,
  BookOpen,
  HeadphonesIcon,
  Wand2
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { 
      path: '/', 
      label: 'Home',
      icon: <Home className="w-4 h-4" />,
    },
    { 
      path: '/text-to-speech', 
      label: 'Text to Speech',
      icon: <Speaker className="w-4 h-4" />,
      dropdownItems: [
        { label: 'Voice Generation', path: '/text-to-speech', icon: <Wand2 className="w-4 h-4" /> },
        { label: 'Voice Library', path: '/text-to-speech', icon: <Library className="w-4 h-4" /> },
      ]
    },
    { 
      path: '/speech-to-text', 
      label: 'Speech to Text',
      icon: <Mic className="w-4 h-4" />,
      dropdownItems: [
        { label: 'Transcription', path: '/speech-to-text', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Live Listen', path: '/speech-to-text', icon: <HeadphonesIcon className="w-4 h-4" /> },
      ]
    },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ 
        y: 0,
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)'
      }}
      transition={{ duration: 0.3 }}
      className={`fixed w-full top-0 z-50 backdrop-blur-md ${
        isScrolled ? 'shadow-lg' : ''
      } transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Speaker className="h-8 w-8 text-primary-600" />
            </motion.div>
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              AudibleScript
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.path)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/80'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.dropdownItems && (
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" 
                      style={{ 
                        transform: activeDropdown === item.path ? 'rotate(180deg)' : 'rotate(0deg)'
                      }} 
                    />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.dropdownItems && (
                  <AnimatePresence>
                    {activeDropdown === item.path && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-1 w-56 rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden"
                      >
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.path}
                            to={dropdownItem.path}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                          >
                            {dropdownItem.icon}
                            <span>{dropdownItem.label}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}

            {/* User Menu */}
            <button className="ml-4 p-2 rounded-full hover:bg-primary-50 transition-colors duration-200">
              <LogOut className="w-5 h-5 text-gray-600 hover:text-primary-600" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden bg-white rounded-b-lg shadow-lg"
            >
              {navItems.map((item) => (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                    } transition-colors duration-200`}
                  >
                    {item.icon}
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                  {item.dropdownItems && (
                    <div className="pl-12 pb-2 space-y-1 bg-gray-50">
                      {item.dropdownItems.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.path}
                          to={dropdownItem.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-2 py-2 px-4 text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                        >
                          {dropdownItem.icon}
                          <span>{dropdownItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;