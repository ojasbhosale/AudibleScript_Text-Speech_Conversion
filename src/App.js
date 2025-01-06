import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TextToSpeech from './pages/TextToSpeech';
import SpeechToText from './pages/SpeechToText';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col ">
        <Navbar />
        <main className="flex-grow mt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text-to-speech" element={<TextToSpeech />} />
            <Route path="/speech-to-text" element={<SpeechToText />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;