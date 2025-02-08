import React, { useState, useEffect } from 'react';
import './App.css';
import Soundfont from 'soundfont-player';
import RetroBackground from './components/RetroBackground';
import './components/RetroBackground.css';
import MatrixRain from './components/MatrixRain';
import GenerationEffect from './components/GenerationEffect';
import RetroSelect from './components/RetroSelect';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [dataStreams, setDataStreams] = useState([]);

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

  const createDataStream = () => {
    const types = ['DATA', 'FREQ', 'HARM', 'PROG', 'SYNC', 'MIDI'];
    const values = Array(4).fill(0).map(() => 
      Math.floor(Math.random() * 999).toString().padStart(3, '0')
    );
    return `${types[Math.floor(Math.random() * types.length)]}:${values.join(':')}`;
  };

  const spawnDataStream = () => {
    const stream = {
      id: Math.random(),
      text: createDataStream(),
      style: {
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
      }
    };
    setDataStreams(prev => [...prev, stream]);
    setTimeout(() => {
      setDataStreams(prev => prev.filter(s => s.id !== stream.id));
    }, 1500);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const streamInterval = setInterval(spawnDataStream, 300);
    
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

      if (!player) {
        await loadInstrument(ac);
      }

      // Keep generation effect visible longer
      // 7 messages * 600ms delay + 2000ms for progress bars + 1000ms for success message
      setTimeout(() => setIsGenerating(false), 8000);
    } catch (error) {
      console.error('Error generating progression:', error);
      setIsGenerating(false);
    } finally {
      clearInterval(streamInterval);
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
      {isGenerating && <GenerationEffect />}
      {dataStreams.map(stream => (
        <div 
          key={stream.id}
          className="data-stream active"
          style={stream.style}
        >
          {stream.text}
        </div>
      ))}
      <header className={`App-header ${isGenerating ? 'generating' : ''}`}>
        <h1>[ CHORD GENERATOR 3000 ]</h1>
        <div className="controls">
          <RetroSelect
            label="KEY:"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              handleParameterChange();
            }}
            options={['C', 'D', 'E', 'F', 'G', 'A', 'B']}
            type="key"
          />
          
          <RetroSelect
            label="STYLE:"
            value={progressionType}
            onChange={(e) => {
              setProgressionType(e.target.value);
              handleParameterChange();
            }}
            options={progressionTypes}
            type="progressionType"
            disabled={isPlaying}
          />
          
          <RetroSelect
            label="INSTRUMENT:"
            value={instrument}
            onChange={(e) => handleInstrumentChange(e.target.value)}
            options={instruments.map(inst => ({
              id: inst,
              name: formatDisplayText(inst)
            }))}
            type="instrument"
            disabled={isLoading || isPlaying}
          />

          <div className="generate-button-container">
            <button 
              onClick={handleGenerate} 
              disabled={isPlaying || isGenerating}
              className="generate-btn"
            >
              {isGenerating ? '>> GENERATING <<' : '>> GENERATE <<'}
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
