import React, { useEffect, useState, useRef } from 'react';
import './GenerationEffect.css';

const GenerationEffect = () => {
  const [lines, setLines] = useState([]);
  const [complete, setComplete] = useState(false);
  const mountedRef = useRef(true);
  const messagesRef = useRef([
    { text: "INITIALIZING QUANTUM CHORD MATRIX...", speed: 180 },
    { text: "RETICULATING MUSICAL SPLINES...", speed: 160 },
    { text: "CALCULATING HARMONIC PROBABILITY FIELD...", speed: 140 },
    { text: "CHARGING SONIC FLUX CAPACITOR...", speed: 120 },
    { text: "ENGAGING JAZZ MODE OVERDRIVE...", speed: 100 },
    { text: "SYNTHESIZING VIRTUAL MUSICIANS...", speed: 80 },
    { text: "APPLYING REVERSE ENTROPY TO NOTES...", speed: 60 }
  ]);

  // Set up mount/unmount handling
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle message addition
  useEffect(() => {
    let currentIndex = 0;
    let messageInterval;

    const addMessage = () => {
      if (!mountedRef.current) return;

      if (currentIndex < messagesRef.current.length) {
        const message = messagesRef.current[currentIndex];
        setLines(prev => [...prev, {
          id: Date.now(),
          text: message.text,
          progress: 0,
          speed: message.speed,
          startTime: Date.now()
        }]);
        currentIndex++;
      } else if (messageInterval) {
        clearInterval(messageInterval);
      }
    };

    messageInterval = setInterval(addMessage, 600);
    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, []);

  // Handle progress updates
  useEffect(() => {
    if (!mountedRef.current) return;

    const progressIntervals = lines.map(line => {
      return setInterval(() => {
        if (!mountedRef.current) return;

        setLines(prev => {
          if (!mountedRef.current) return prev;

          const newLines = prev.map(l => {
            if (l.id === line.id) {
              const elapsedTime = Date.now() - l.startTime;
              // Make progress more deterministic based on time
              const targetProgress = Math.min(100, (elapsedTime / 2000) * 100);
              return { ...l, progress: targetProgress };
            }
            return l;
          });

          // Check if all lines are complete
          const allComplete = newLines.length === messagesRef.current.length && 
                            newLines.every(l => l.progress >= 100);

          if (allComplete && mountedRef.current) {
            setTimeout(() => {
              if (mountedRef.current) {
                setComplete(true);
              }
            }, 500);
          }

          return newLines;
        });
      }, 16); // 60fps update
    });

    return () => {
      progressIntervals.forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [lines]);

  const getRandomSuccessEmoji = () => {
    const emojis = ['🎵', '🎹', '🎼', '🎸', '🎺', '🥁', '🎷'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const getFunnyLoadingMessage = (progress) => {
    if (progress < 30) return "WARMING UP...";
    if (progress < 60) return "ALMOST THERE...";
    if (progress < 90) return "ANY SECOND NOW...";
    return "FINALIZING...";
  };

  return (
    <div className={`generation-effect ${complete ? 'complete' : ''}`}>
      <div className={`terminal ${complete ? 'success' : ''}`}>
        <div className="terminal-header">
          <span className="terminal-title">SYSTEM://musical_mainframe</span>
          <div className="terminal-controls">
            <span className="cpu-load">CPU: {Math.floor(Math.random() * 30 + 70)}%</span>
            <span className="memory-load">RAM: {Math.floor(Math.random() * 20 + 80)}%</span>
          </div>
        </div>
        <div className="terminal-content">
          {lines.map((line) => (
            <div key={line.id} className="terminal-line">
              <span className="terminal-prefix">[SYS]&gt;</span>
              <span className="terminal-text">{line.text}</span>
              <div className="terminal-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${line.progress}%` }}
                />
                <span className="progress-message">
                  {getFunnyLoadingMessage(line.progress)}
                </span>
                <span className="progress-text">{Math.floor(line.progress)}%</span>
              </div>
            </div>
          ))}
          {complete && (
            <div className="success-message">
              <div className="success-text">
                <span className="emoji-left">{getRandomSuccessEmoji()}</span>
                PROGRESSION SUCCESSFULLY GENERATED!
                <span className="emoji-right">{getRandomSuccessEmoji()}</span>
              </div>
              <div className="success-subtext">Time to make some noise...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationEffect;
