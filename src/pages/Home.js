import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Volume2, 
  Mic,
  FileText,
  FileAudio,
  Upload,
  Download,
  ArrowRight
} from 'lucide-react';

const mainFeatures = [
  {
    icon: Volume2,
    title: 'Text to Speech',
    description: 'Convert any text into natural-sounding speech with our advanced neural TTS engine.',
    link: '/text-to-speech',
    color: 'from-blue-600 to-indigo-600',
    bgLight: 'from-blue-50 to-indigo-50'
  },
  {
    icon: Mic,
    title: 'Speech to Text',
    description: 'Transform speech into text with industry-leading accuracy using our cutting-edge STT technology.',
    link: '/speech-to-text',
    color: 'from-violet-600 to-purple-600',
    bgLight: 'from-violet-50 to-purple-50'
  }
];

const supportedFeatures = [
  {
    icon: Upload,
    title: 'Upload Files',
    description: 'Support for TXT, DOC, PDF files and MP3, WAV audio formats',
  },
  {
    icon: Download,
    title: 'Download Results',
    description: 'Export as high-quality MP3 audio or formatted text files',
  },
  {
    icon: FileText,
    title: 'Text Processing',
    description: 'Advanced text formatting with punctuation support',
  },
  {
    icon: FileAudio,
    title: 'Audio Enhancement',
    description: 'Noise reduction and audio quality optimization',
  }
];

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] }
    }
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    hover: { 
      y: -8,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <div className="relative pt-16 pb-20 overflow-hidden bg-gray-50">
      {/* Background Gradient Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
      >
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 leading-tight tracking-tight"
          >
            Intelligent Voice & Text
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Conversion Technology
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 leading-relaxed"
          >
            Transform between voice and text seamlessly with our powerful AI-driven conversion tools.
          </motion.p>
        </div>

        {/* Main Features */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 mb-24">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="relative group"
            >
              <Link to={feature.link}>
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgLight} opacity-50`} />
                  <div className="relative p-8">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-gray-900 font-semibold">
                      Try Now <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Supported Features */}
        <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Advanced Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex p-2 rounded-lg bg-gray-100 mb-4">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Home;