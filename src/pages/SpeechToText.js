import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicrophoneIcon, 
  DocumentArrowUpIcon,
  ArrowDownTrayIcon,
  StopIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  LanguageIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Constants
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_AUDIO_FORMATS = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm'];
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'zh-CN', name: 'Chinese' },
];

const SpeechToText = () => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcriptionHistory, setTranscriptionHistory] = useState([]);
  const [isSpeechSupported] = useState(() => 
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );

  // Refs
  const recognition = useRef(null);
  const mediaRecorder = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const microphone = useRef(null);
  const timerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const settingsRef = useRef(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Click outside settings handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Timer management
  useEffect(() => {
    if (isRecording && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
    if (!isRecording && timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Audio visualization
  const updateAudioLevel = useCallback(() => {
    if (analyser.current) {
      const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
      analyser.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
    }
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  // Audio context setup
  const setupAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      microphone.current = audioContext.current.createMediaStreamSource(stream);
      microphone.current.connect(analyser.current);
      analyser.current.fftSize = 256;
      updateAudioLevel();

      // Setup MediaRecorder for saving audio
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(chunks => [...chunks, event.data]);
        }
      };
    } catch (err) {
      throw new Error(`Microphone access denied: ${err.message}`);
    }
  };

  // Start recording
  const startRecording = async () => {
    setError('');
    setAudioChunks([]);
    
    try {
      if (!isSpeechSupported) {
        throw new Error('Speech recognition is not supported in your browser');
      }

      await setupAudioContext();

      recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = selectedLanguage.code;

      recognition.current.onstart = () => {
        setIsRecording(true);
        mediaRecorder.current.start();
      };

      recognition.current.onend = () => {
        setIsRecording(false);
        mediaRecorder.current.stop();
      };

      recognition.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setText(prevText => {
          const newText = finalTranscript + interimTranscript;
          if (newText !== prevText) {
            setTranscriptionHistory(prev => [...prev, { 
              text: newText, 
              timestamp: new Date().toISOString(),
              language: selectedLanguage.code
            }]);
          }
          return newText;
        });
      };

      recognition.current.start();
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
  };

  // Save audio recording
  const saveRecording = () => {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    setError('');
    setIsProcessing(true);

    try {
      if (!file) return;

      if (file.size > MAX_AUDIO_SIZE) {
        throw new Error(`File size exceeds the ${MAX_AUDIO_SIZE / 1024 / 1024}MB limit`);
      }

      if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
        throw new Error(`Unsupported format. Supported: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`);
      }

      // Here you would typically send the file to a backend service
      // For demo purposes, we'll just show success
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const pulseVariants = {
    recording: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-12 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Speech to Text Converter
            </h1>
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Settings"
              >
                <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-600" />
              </button>
              
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  >
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Language
                          </label>
                          <select
                            value={selectedLanguage.code}
                            onChange={(e) => {
                              const lang = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                              setSelectedLanguage(lang);
                            }}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          >
                            {SUPPORTED_LANGUAGES.map((lang) => (
                              <option key={lang.code} value={lang.code}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-red-700">{error}</span>
                  <button
                    onClick={() => setError('')}
                    className="text-red-700 hover:text-red-900 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md"
              >
                <div className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-700">Audio processed successfully!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Audio File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 cursor-pointer hover:border-purple-500 transition-colors duration-200">
                  <DocumentArrowUpIcon className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-base text-gray-600">Select an audio file</span>
                  <span className="text-sm text-gray-500 mt-1">
                    Max size: 10MB | Supported: {SUPPORTED_AUDIO_FORMATS.join(', ')}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    disabled={isProcessing}
                  />
                </label>
              </div>
            </div>

            {/* Transcription Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transcription
              </label>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-40 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-shadow"
                  placeholder="Transcription appears here..."
                  disabled={isProcessing}
                />
                {text && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(text);
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 2000);
                    }}
                    className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || !isSpeechSupported}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium text-white shadow-lg transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={pulseVariants}
                animate={isRecording ? "recording" : ""}
              >
                {isRecording ? (
                  <StopIcon className="w-5 h-5" />
                ) : (
                  <MicrophoneIcon className="w-5 h-5" />
                )}
                <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
              </motion.button>

              {audioChunks.length > 0 && (
                <motion.button
                  onClick={saveRecording}
                  className="flex items-center space-x-2 px-6 py-3 rounded-full font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>Save Recording</span>
                </motion.button>
              )}
            </div>

            {/* Status Information */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5" />
                <span>{formatTime(recordingTime)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <LanguageIcon className="w-5 h-5" />
                <span>{selectedLanguage.name}</span>
              </div>

              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="relative w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-purple-500"
                      style={{ width: `${audioLevel * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <span>Level</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transcription History */}
        {transcriptionHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Transcription History</h2>
            <div className="space-y-4">
              {transcriptionHistory.slice(-5).map((entry, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    <span>{SUPPORTED_LANGUAGES.find(l => l.code === entry.language)?.name}</span>
                  </div>
                  <p className="text-gray-700">{entry.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SpeechToText;

