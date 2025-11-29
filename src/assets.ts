import { CandyType } from './types';

// Simplified SVG paths for standard shapes
export const CANDY_PATHS: Record<CandyType, Path2D> = {
    [CandyType.Red]: new Path2D("M10 25 C10 5 40 5 40 25 C40 45 10 45 10 25 Z"), // Bean
    [CandyType.Orange]: new Path2D("M25 5 L45 25 L25 45 L5 25 Z"), // Lozenge
    [CandyType.Yellow]: new Path2D("M25 5 L45 15 L45 35 L25 45 L5 35 L5 15 Z"), // Hexagon
    [CandyType.Green]: new Path2D("M5 5 L45 5 L45 35 L25 45 L5 35 Z"), // Square/Pentagonish
    [CandyType.Blue]: new Path2D("M5 5 L45 5 L45 45 L5 45 Z"), // Square
    [CandyType.Purple]: new Path2D("M25 5 L30 20 L45 20 L35 30 L40 45 L25 35 L10 45 L15 30 L5 20 L20 20 Z"), // Star
    [CandyType.White]: new Path2D("M25 5 A20 20 0 1 0 25 45 A20 20 0 1 0 25 5 Z M20 15 L30 15 L30 35 L20 35 Z"), // Bomb
    [CandyType.Empty]: new Path2D()
};

export const CANDY_COLORS: Record<CandyType, string> = {
    [CandyType.Red]: '#e74c3c',
    [CandyType.Orange]: '#e67e22',
    [CandyType.Yellow]: '#f1c40f',
    [CandyType.Green]: '#2ecc71',
    [CandyType.Blue]: '#3498db',
    [CandyType.Purple]: '#9b59b6',
    [CandyType.White]: '#ecf0f1',
    [CandyType.Empty]: 'transparent'
};

// Simple Audio Synthesizer to avoid loading assets
const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
const audioCtx = new AudioContextClass();

export function playSound(type: 'pop' | 'swap' | 'fall' | 'win') {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'pop') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'swap') {
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        osc.frequency.setValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
    }
}