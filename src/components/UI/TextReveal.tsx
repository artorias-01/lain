import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className = '', delay = 0.2 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const words = containerRef.current.querySelectorAll('.word-inner');
    gsap.fromTo(
      words,
      {
        y: '110%',
        opacity: 0,
        rotateX: -45,
      },
      {
        y: '0%',
        opacity: 1,
        rotateX: 0,
        duration: 1.1,
        stagger: 0.08,
        delay,
        ease: 'power4.out',
      }
    );
  }, [text, delay]);

  const wordsList = text.split(' ');

  return (
    <div ref={containerRef} className={`inline-flex flex-wrap gap-x-[0.3em] overflow-hidden ${className}`}>
      {wordsList.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden py-1">
          <span className="word-inner inline-block transform-gpu origin-bottom">
            {word}
          </span>
        </span>
      ))}
    </div>
  );
};
