import React from 'react';
import { motion } from 'framer-motion';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  MessageSquare,
  FileText,
  Download,
  Upload,
  HelpCircle
} from 'lucide-react';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const features = [
    { icon: FileText, text: "Text to Speech Conversion" },
    { icon: MessageSquare, text: "Speech to Text Conversion" },
    { icon: Upload, text: "Multiple File Formats" },
    { icon: Download, text: "Easy Download Options" }
  ];

  const quickLinks = [
    { text: "Documentation", href: "/docs" },
    { text: "API Access", href: "/api" },
    { text: "Pricing", href: "/pricing" },
    { text: "Support", href: "/support" }
  ];

  return (
    <motion.footer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AudibleScript
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Revolutionizing voice and text conversion with cutting-edge AI technology. Making content accessible and conversion effortless.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/yourusername" 
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/in/yourusername"
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/yourusername"
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200">
                  <feature.icon className="w-5 h-5 mr-3" />
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="group flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:translate-x-1" />
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="mailto:support@audiblescript.com" 
                  className="flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  <span>support@audiblescript.com</span>
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="w-5 h-5 mr-3" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center text-gray-400">
                <MapPin className="w-5 h-5 mr-3" />
                <span>San Francisco, CA</span>
              </li>
              <li className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:opacity-90 transition-opacity duration-200 flex items-center justify-center space-x-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Get Support</span>
                </motion.button>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          variants={itemVariants}
          className="pt-8 border-t border-gray-700/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} AudibleScript. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="/privacy" className="hover:text-gray-300 transition-colors duration-200">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-300 transition-colors duration-200">Terms of Service</a>
            <a href="/cookies" className="hover:text-gray-300 transition-colors duration-200">Cookie Policy</a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;