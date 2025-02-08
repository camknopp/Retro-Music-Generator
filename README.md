# Retro Audio Visualizer

A dynamic web application that generates and visualizes musical chord progressions with a retro aesthetic style. This project combines modern web technologies with a nostalgic visual design to create an interactive music generation experience.

## Features

- **Chord Progression Generation**: Generate complex musical chord progressions in different styles:
  - Jazz progressions with 9th chords
  - Extended harmony with 11th and 13th chords
  - Complex voicings with mixed harmonies
- **Real-time Audio Playback**: Instant playback of generated progressions using high-quality instrument samples
- **MIDI Export**: Download your generated progressions as MIDI files for use in other music software
- **Retro Visual Design**: Immersive retro-style interface featuring:
  - Synthwave-inspired grid animations
  - Neon color scheme
  - Dynamic scanlines and particle effects
  - Responsive visual feedback

## Technology Stack

- **Frontend**: React.js with modern JavaScript features
  - Soundfont-player for high-quality instrument playback
  - Custom CSS animations for retro visual effects
  - Responsive design for various screen sizes

- **Backend**: Node.js with Express
  - MIDI file generation capabilities
  - RESTful API for chord progression generation
  - Cross-origin resource sharing enabled

## Project Structure

- `frontend/`: React application for the user interface and visualization
  - Modern component architecture
  - Custom hooks for audio handling
  - Extensive CSS animations for visual effects

- `backend/`: Node.js server handling audio processing
  - MIDI file generation
  - Chord progression algorithms
  - RESTful API endpoints

## Getting Started

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   node index.js
   ```

The backend server will start on port 3001.

## Development

The frontend will automatically reload when you make changes. You may see any lint errors in the console.

### Building for Production

To build the frontend for production:

```
cd frontend
npm run build
```

This builds the app to the `build` folder, optimizing for best performance with minified files and hashed filenames.

## Testing

To run the frontend test suite:

```
cd frontend
npm test
```

This launches the test runner in interactive watch mode.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.