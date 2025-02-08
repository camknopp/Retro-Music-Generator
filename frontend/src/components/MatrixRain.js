import React, { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - mix of katakana, numbers and symbols
    const chars = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEF';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    // Gradient for the text
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0F0');  // Bright green at top
    gradient.addColorStop(0.2, '#0F0'); // Still bright green
    gradient.addColorStop(1, '#040');   // Darker green at bottom

    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = gradient;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Calculate positions
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        // Add glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#0F0';
        
        // Draw the character
        ctx.fillText(char, x, y);
        
        // Reset shadow for performance
        ctx.shadowBlur = 0;
        
        // Random chance of bright character
        if (Math.random() > 0.975) {
          ctx.fillStyle = '#FFF';
          ctx.fillText(char, x, y);
          ctx.fillStyle = gradient;
        }
        
        // Reset to top with random chance when reaching bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Move drop down
        drops[i]++;
      }
    };
    
    // Run animation at 30fps
    const interval = setInterval(draw, 33);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: 0.7  // Increased opacity
      }}
    />
  );
};

export default MatrixRain;