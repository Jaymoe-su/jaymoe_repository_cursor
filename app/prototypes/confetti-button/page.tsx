"use client";

import { useState } from 'react';
import styles from './styles.module.css';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface BurnMark {
  id: string;
  x: number;
  y: number;
  size: number;
}

export default function ConfettiButtonPrototype() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [burnMarks, setBurnMarks] = useState<BurnMark[]>([]);

  const createExplosion = (x: number, y: number, particleCount: number, isSecondary: boolean = false) => {
    // Create explosion effect
    confetti({
      particleCount: particleCount,
      angle: Math.random() * 360,
      spread: isSecondary ? 45 : 90,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ['#FF4500', '#FF6347', '#FF8C00', '#FFD700', '#FF0000', '#8B0000'],
      shapes: ['circle'],
      gravity: 0.8,
      drift: (Math.random() - 0.5) * 2,
      ticks: 100,
      decay: 0.92,
    });

    // Add burn mark if it's a secondary explosion
    if (isSecondary) {
      const burnMark: BurnMark = {
        id: `burn-${Date.now()}-${Math.random()}`,
        x: x,
        y: y,
        size: 30 + Math.random() * 40,
      };
      
      setBurnMarks(prev => [...prev, burnMark]);
      
      // Remove burn mark after 5 seconds
      setTimeout(() => {
        setBurnMarks(prev => prev.filter(mark => mark.id !== burnMark.id));
      }, 5000);
    }
  };

  const triggerExplosions = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsAnimating(true);
    
    // Get button position on screen
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const buttonX = rect.left + rect.width / 2;
    const buttonY = rect.top + rect.height / 2;
    
    // Main explosion at button position
    createExplosion(buttonX, buttonY, 150, false);
    
    // Create cluster bomb effect - primary explosions
    const primaryExplosions = 3 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < primaryExplosions; i++) {
      const delay = 200 + Math.random() * 300;
      const angle = (Math.PI * 2 * i) / primaryExplosions + Math.random() * 0.5;
      const distance = 150 + Math.random() * 200;
      const x = buttonX + Math.cos(angle) * distance;
      const y = buttonY + Math.sin(angle) * distance;
      
      setTimeout(() => {
        createExplosion(x, y, 80, false);
        
        // Secondary explosions from each primary
        const secondaryCount = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < secondaryCount; j++) {
          const secondaryDelay = 100 + Math.random() * 200;
          const secondaryAngle = Math.random() * Math.PI * 2;
          const secondaryDistance = 50 + Math.random() * 100;
          const secondaryX = x + Math.cos(secondaryAngle) * secondaryDistance;
          const secondaryY = y + Math.sin(secondaryAngle) * secondaryDistance;
          
          setTimeout(() => {
            createExplosion(secondaryX, secondaryY, 40, true);
          }, secondaryDelay);
        }
      }, delay);
    }

    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <Link href="/" className={styles.backButton}>←</Link>
      </div>
      
      <div className={styles.window}>
        <div className={styles.windowTitle}>
          Confetti button
        </div>
        <div className={styles.windowContent}>
          <div className={styles.warningLabel}>⚠️ WARNING: CLASSIFIED ⚠️</div>
          <div className={styles.buttonWrapper}>
            <div className={styles.buttonGlow}></div>
            <button 
              className={`${styles.confettiButton} ${isAnimating ? styles.animate : ''}`}
              onClick={triggerExplosions}
            >
              <span className={styles.buttonText}>LAUNCH</span>
            </button>
          </div>
          <div className={styles.statusIndicator}>ARMED</div>
        </div>
      </div>

      {/* Burn marks */}
      {burnMarks.map((mark) => (
        <div
          key={mark.id}
          className={styles.burnMark}
          style={{
            left: `${mark.x}px`,
            top: `${mark.y}px`,
            width: `${mark.size}px`,
            height: `${mark.size}px`,
          }}
        />
      ))}

      {/* Pikachu running along bottom */}
      <div className={styles.pikachuContainer}>
        <Image
          src="/playground/pikachu-running.gif"
          alt="Pikachu running"
          width={100}
          height={100}
          className={styles.pikachu}
          unoptimized
        />
      </div>
    </div>
  );
} 