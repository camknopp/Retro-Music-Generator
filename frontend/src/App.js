import React, { useState, useEffect } from 'react';
import './App.css';
import Soundfont from 'soundfont-player';
import RetroBackground from './components/RetroBackground';
import './components/RetroBackground.css';
import MatrixRain from './components/MatrixRain';

function App() {
  const [key, setKey] = useState('C');
  const [noteData, setNoteData] = useState(null);
  const [instrument, setInstrument] = useState('acoustic_grand_piano');
  const [audioContext, setAudioContext] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [midiBlob, setMidiBlob] = useState(null);
  const [progressionType, setProgressionType] = useState('jazz');

  const instruments = [
    'acoustic_grand_piano',
    'electric_piano_1',
    'violin',
    'trumpet',
    'acoustic_guitar_nylon',
    'flute',
    'saxophone',
    'synth_lead_1_square'
  ];

  const progressionTypes = [
    { id: 'jazz', name: 'JAZZ (9th chords)' },
    { id: 'extended', name: 'EXTENDED (11th/13th)' },
    { id: 'complex', name: 'COMPLEX (Mixed voicings)' }
  ];

  // Initialize audio context only when needed
  const ensureAudioContext = async () => {
    if (!audioContext) {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      await ac.resume();
      setAudioContext(ac);
      return ac;
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return audioContext;
  };

  // Load instrument
  const loadInstrument = async (ac) => {
    if (!ac) return null;
    try {
      setIsLoading(true);
      const newPlayer = await Soundfont.instrument(ac, instrument);
      setPlayer(newPlayer);
      setIsLoading(false);
      return newPlayer;
    } catch (err) {
      console.error('Error loading instrument:', err);
      setIsLoading(false);
      return null;
    }
  };

  const handleGenerate = async () => {
    try {
      const ac = await ensureAudioContext();
      
      const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          key,
          progressionType 
        })
      });
      
      const data = await response.json();
      setNoteData(data.noteData);
      
      const blob = new Blob([Uint8Array.from(atob(data.midi), c => c.charCodeAt(0))], 
        { type: 'audio/midi' });
      setMidiBlob(blob);

      // Ensure instrument is loaded
      if (!player) {
        await loadInstrument(ac);
      }
    } catch (error) {
      console.error('Error generating progression:', error);
    }
  };

  const playProgression = async () => {
    if (!noteData || isPlaying) return;
    
    try {
      const ac = await ensureAudioContext();
      let currentPlayer = player;
      
      if (!currentPlayer) {
        currentPlayer = await loadInstrument(ac);
      }
      
      if (!currentPlayer) return;

      setIsPlaying(true);
      
      for (const chord of noteData) {
        if (!isPlaying) break;
        await new Promise((resolve) => {
          chord.notes.forEach(note => {
            currentPlayer.play(note, ac.currentTime, { duration: chord.duration });
          });
          setTimeout(resolve, chord.duration * 1000);
        });
      }
    } catch (error) {
      console.error('Error playing progression:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    if (player) {
      player.stop();
    }
    setIsPlaying(false);
  };

  const handleInstrumentChange = async (newInstrument) => {
    if (isPlaying) {
      stopPlayback();
    }
    setInstrument(newInstrument);
    setPlayer(null);
    handleParameterChange();

    // Pre-load the new instrument if we have an audio context
    if (audioContext) {
      await loadInstrument(audioContext);
    }
  };

  const handleParameterChange = () => {
    setNoteData(null);
    setMidiBlob(null);
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!midiBlob) return;
    const url = URL.createObjectURL(midiBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'chord-progression.mid';
    downloadLink.click();
    URL.revokeObjectURL(url);
  };

  const formatDisplayText = (text) => {
    return text.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (player) {
        player.stop();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  return (
    <div className="App">
      <MatrixRain />
      <RetroBackground />
      <header className="App-header">
        <h1>[ RETRO CHORD GENERATOR ]</h1>
        <div className="controls">
          <div className="control-group" data-type="key">
            <label htmlFor="key">KEY:</label>
            <select 
              id="key" 
              value={key} 
              onChange={(e) => {
                setKey(e.target.value);
                handleParameterChange();
              }}
            >
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          
          <div className={`control-group progression-${progressionType}`} data-type="progressionType">
            <label htmlFor="progressionType">STYLE:</label>
            <select 
              id="progressionType" 
              value={progressionType} 
              onChange={(e) => {
                setProgressionType(e.target.value);
                handleParameterChange();
              }}
              disabled={isPlaying}
            >
              {progressionTypes.map(type => (
                <option key={type.id} value={type.id} className="scrolling-option">
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="control-group" data-type="instrument">
            <label htmlFor="instrument">INSTRUMENT:</label>
            <select 
              id="instrument" 
              value={instrument} 
              onChange={(e) => handleInstrumentChange(e.target.value)}
              disabled={isLoading || isPlaying}
            >
              {instruments.map(inst => (
                <option key={inst} value={inst} className="scrolling-option">
                  {formatDisplayText(inst)}
                </option>
              ))}
            </select>
          </div>

          <div className="generate-button-container">
            <button 
              onClick={handleGenerate} 
              disabled={isPlaying}
              className="generate-btn"
            >
              &gt;&gt; GENERATE &lt;&lt;
            </button>
          </div>
        </div>
        
        {noteData && !isLoading && (
          <div className="midi-player">
            <div className="button-group">
              <button 
                onClick={isPlaying ? stopPlayback : playProgression}
                className={isPlaying ? 'stop-btn' : 'play-btn'}
                disabled={isLoading}
              >
                {isPlaying ? '>> STOP <<' : '>> PLAY <<'}
              </button>
              <button 
                onClick={handleDownload}
                disabled={!midiBlob || isPlaying}
                className="download-btn"
              >
                &gt;&gt; SAVE &lt;&lt;
              </button>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="loading">
            LOADING INSTRUMENT...
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
