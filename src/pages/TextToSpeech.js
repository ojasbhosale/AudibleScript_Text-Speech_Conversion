import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Pause, FileText, Download, X, Check, Settings, Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_FILE_TYPES = new Set(['.txt', '.doc', '.docx']);
const FADE_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export default function TextToSpeech() {
  const [state, setState] = useState({
    text: '',
    isPlaying: false,
    audioUrl: '',
    error: '',
    voices: [],
    selectedVoice: null,
    speechRate: 1,
    pitch: 1,
    isLoading: false,
    showSuccess: false,
    showDropdown: false
  });

  const synth = useRef(window.speechSynthesis);
  const utterance = useRef(null);
  const textRef = useRef(state.text);
  const audioContext = useRef(null);
  const dropdownRef = useRef(null);

  const handleError = useCallback((message) => {
    setState(prev => ({ 
      ...prev, 
      error: message,
      isLoading: false 
    }));
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setState(prev => ({ ...prev, showDropdown: false }));
    }
  }, []);

  const initializeVoices = useCallback(() => {
    const loadVoices = () => {
      const availableVoices = synth.current.getVoices();
      if (availableVoices.length) {
        setState(prev => ({
          ...prev,
          voices: availableVoices,
          selectedVoice: availableVoices.find(voice => voice.default) || availableVoices[0]
        }));
      }
    };

    loadVoices();
    synth.current.onvoiceschanged = loadVoices;
  }, []);

  // Effect for initialization and cleanup
  useEffect(() => {
    // Store ref values that might change
    const currentSynth = synth.current;

    const initializeAudioContext = () => {
      try {
        // Only initialize if not already initialized
        if (!audioContext.current || audioContext.current.state === 'closed') {
          audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }
      } catch (error) {
        handleError('Audio context initialization failed');
      }
    };

    initializeVoices();
    initializeAudioContext();
    document.addEventListener('click', handleClickOutside);
    
    // Cleanup function using stored ref values
    return () => {
      if (currentSynth?.speaking) {
        currentSynth.cancel();
      }
      
      // Safely handle audioContext cleanup
      const currentAudioContext = audioContext.current;
      if (currentAudioContext && currentAudioContext.state !== 'closed') {
        try {
          currentAudioContext.close().catch(() => {
            // Silently handle any errors during close
          });
        } catch (error) {
          // Ignore any errors during cleanup
        }
      }

      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside, initializeVoices, handleError, state.audioUrl]);

  // Effect for text ref update
  useEffect(() => {
    textRef.current = state.text;
  }, [state.text]);

  const validateFile = useCallback((file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!SUPPORTED_FILE_TYPES.has(fileExtension)) {
      throw new Error(`Unsupported file type. Supported: ${[...SUPPORTED_FILE_TYPES].join(', ')}`);
    }
  }, []);

  const readFileContent = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      validateFile(file);
      const text = await readFileContent(file);
      setState(prev => ({ 
        ...prev, 
        text,
        showSuccess: true,
        isLoading: false 
      }));
      setTimeout(() => setState(prev => ({ ...prev, showSuccess: false })), 3000);
    } catch (error) {
      handleError(error.message);
    }
  }, [validateFile, readFileContent, handleError]);

  const createDownloadableAudio = useCallback(async () => {
    // Only proceed if audioContext is available and not closed
    if (!audioContext.current || audioContext.current.state === 'closed') {
      try {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        handleError('Failed to initialize audio context');
        return;
      }
    }
    
    try {
      const oscillator = audioContext.current.createOscillator();
      const mediaStreamDestination = audioContext.current.createMediaStreamDestination();
      oscillator.connect(mediaStreamDestination);
      
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks = [];

      return new Promise((resolve) => {
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const url = URL.createObjectURL(audioBlob);
          setState(prev => ({ ...prev, audioUrl: url }));
          resolve();
        };

        mediaRecorder.start();
        oscillator.start();
        setTimeout(() => {
          mediaRecorder.stop();
          oscillator.stop();
        }, 100);
      });
    } catch (error) {
      handleError('Failed to create downloadable audio');
    }
  }, [handleError]);

  const startSpeech = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (synth.current.speaking) synth.current.cancel();

      utterance.current = new SpeechSynthesisUtterance(textRef.current);
      utterance.current.voice = state.selectedVoice;
      utterance.current.rate = state.speechRate;
      utterance.current.pitch = state.pitch;

      utterance.current.onend = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
        createDownloadableAudio().then(resolve);
      };

      utterance.current.onerror = (event) => {
        reject(new Error('Speech synthesis failed: ' + event.error));
      };

      synth.current.speak(utterance.current);
      resolve();
    });
  }, [state.selectedVoice, state.speechRate, state.pitch, createDownloadableAudio]);

  const handleSpeak = useCallback(async () => {
    try {
      if (!textRef.current.trim()) {
        throw new Error('Please enter text to convert to speech');
      }

      if (state.isPlaying) {
        synth.current.pause();
      } else {
        if (synth.current.paused) {
          synth.current.resume();
        } else {
          await startSpeech();
        }
      }
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    } catch (error) {
      handleError(error.message);
    }
  }, [state.isPlaying, startSpeech, handleError]);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={FADE_ANIMATION}
    >
      <div className="container mx-auto px-4 pb-16 max-w-4xl">
        <motion.div 
          className="space-y-8 bg-white rounded-2xl shadow-xl p-8"
          variants={FADE_ANIMATION}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-800">
              Text to Speech
            </h1>
            <Settings className="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
          </div>

          <AnimatePresence>
            {state.error && (
              <motion.div
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
                {...FADE_ANIMATION}
              >
                <span className="text-red-600">{state.error}</span>
                <button 
                  onClick={() => setState(prev => ({ ...prev, error: '' }))}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {state.showSuccess && (
              <motion.div
                className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
                {...FADE_ANIMATION}
              >
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-600">File uploaded successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Text File
              </label>
              <div className="relative group">
                <input
                  type="file"
                  className="hidden"
                  accept={[...SUPPORTED_FILE_TYPES].join(',')}
                  onChange={handleFileUpload}
                  disabled={state.isLoading}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-500 hover:bg-blue-50"
                >
                  {state.isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-blue-500" />
                  )}
                  <span className="mt-2 text-sm text-gray-600">
                    Drop your file here or click to upload
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Max: 5MB | {[...SUPPORTED_FILE_TYPES].join(', ')}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Type Text
              </label>
              <textarea
                value={state.text}
                onChange={(e) => setState(prev => ({ ...prev, text: e.target.value }))}
                className="w-full min-h-[200px] p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Enter text to convert to speech..."
                disabled={state.isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice
                </label>
                <button
                  onClick={() => setState(prev => ({ ...prev, showDropdown: !prev.showDropdown }))}
                  className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg flex items-center justify-between hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <span>{state.selectedVoice?.name || 'Select voice'}</span>
                  <motion.span
                    animate={{ rotate: state.showDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence>
                  {state.showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                      {state.voices.map(voice => (
                        <button
                          key={voice.name}
                          onClick={() => {
                            setState(prev => ({
                              ...prev,
                              selectedVoice: voice,
                              showDropdown: false
                            }));
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50"
                        >
                          {voice.name} ({voice.lang})
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speech Rate: {state.speechRate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={state.speechRate}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    speechRate: parseFloat(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpeak}
                disabled={state.isLoading || !state.text.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {state.isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
                <span>{state.isPlaying ? 'Pause' : 'Speak'}</span>
              </motion.button>

              {state.audioUrl && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={state.audioUrl}
                  download="speech.wav"
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Audio</span>
                </motion.a>
              )}
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Advanced Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch: {state.pitch}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={state.pitch}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    pitch: parseFloat(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Voice Properties
                </label>
                {state.selectedVoice && (
                  <div className="text-sm text-gray-600">
                    <p>Language: {state.selectedVoice.lang}</p>
                    <p>Local Service: {state.selectedVoice.localService ? 'Yes' : 'No'}</p>
                    <p>Voice URI: {state.selectedVoice.voiceURI}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {synth.current?.speaking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Speaking...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

