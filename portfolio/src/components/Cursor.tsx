'use client';

import { useEffect, useRef } from 'react';

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;

    const updateMousePosition = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      
      // Use requestAnimationFrame for completely lag-free 60fps tracking
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          if (cursor) {
            cursor.style.transform = `translate(${targetX - 16}px, ${targetY - 16}px)`;
          }
          rafId = 0;
        });
      }
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        border: '1px solid rgba(0, 240, 255, 0.5)',
        pointerEvents: 'none',
        zIndex: 9999,
        boxShadow: '0 0 15px rgba(0, 240, 255, 0.6)',
        willChange: 'transform',
      }}
    />
  );
}
