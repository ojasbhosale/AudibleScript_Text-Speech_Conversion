# AudibleScript

- AudibleScript is a modern web application that converts text to speech (TTS) and speech to text (STT). It offers a seamless, user-friendly experience with professional styling and animations. The app is built using React.js, TailwindCSS, and modern web APIs.
- Deployed Link: https://audible-script-ojasbhosale.netlify.app/


## Features

### General Features
- Fully responsive design.
- Stylish, modern UI with smooth animations and transitions.
- Fixed navigation bar with links to Home, Text-to-Speech, and Speech-to-Text pages.

### Text-to-Speech (TTS)
- Input text via a text box or upload a `.txt` file.
- Convert text into high-quality speech.
- Download the generated speech as an audio file.

### Speech-to-Text (STT)
- Real-time transcription from speech input via a microphone.
- Upload audio files to convert into text (future enhancement).
- Download the transcribed text.

## Technologies Used

### Frontend
- **React.js**: A JavaScript library for building user interfaces.
- **TailwindCSS**: A utility-first CSS framework for styling.
- **Framer Motion**: For smooth animations and transitions.
- **Heroicons**: Modern icons for navigation and features.

### APIs
- **Web Speech API**: For both TTS and STT functionalities (browser-based, free to use).

### Hosting
- Deployed on **Netlify** or **Vercel** (choose based on preference).

## File Structure

```
./audible-script/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Home.jsx
│   │   ├── TTS.jsx
│   │   ├── STT.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── index.js
```

## Installation and Setup

### Prerequisites
- Node.js installed on your system.
- A code editor (e.g., Visual Studio Code).

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/audible-script.git
   cd audible-script
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`.

## Usage

### 1. Home Page
- View a welcome message and an overview of the app's features.

### 2. Text-to-Speech
- Enter text in the text box or upload a `.txt` file.
- Click "Convert to Speech" to hear the text spoken aloud.
- Optionally, download the audio file.

### 3. Speech-to-Text
- Click "Start Speaking" and speak into your microphone to see real-time transcription.
- Optionally, download the transcribed text.

## Future Enhancements
- Add support for audio file uploads in the Speech-to-Text feature.
- Enable multi-language support.
- Improve speech customization options (e.g., voice type, pitch, speed).

## Contributing
Contributions are welcome! Feel free to fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For any queries or suggestions, feel free to reach out:
- Email: ojasbhosale07@gmail.com
- GitHub: [@ojasbhosale](https://github.com/ojasbhosale)
- LinkedIn: [Ojas Bhosale](https://linkedin.com/in/ojas-bhosale)
