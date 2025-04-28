import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  
  return (
    <div className={`text-secondary ${sizeClasses[size]} ${className}`}>
      {/* This is a placeholder logo that can be easily replaced with the actual SVG logo */}
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100C77.6 100 100 77.6 100 50C100 22.4 77.6 0 50 0ZM50 85C30.7 85 15 69.3 15 50C15 30.7 30.7 15 50 15C69.3 15 85 30.7 85 50C85 69.3 69.3 85 50 85Z" />
        <path d="M65 35H55V25C55 22.2 52.8 20 50 20C47.2 20 45 22.2 45 25V35H35C32.2 35 30 37.2 30 40C30 42.8 32.2 45 35 45H45V75C45 77.8 47.2 80 50 80C52.8 80 55 77.8 55 75V45H65C67.8 45 70 42.8 70 40C70 37.2 67.8 35 65 35Z" />
      </svg>
    </div>
  );
};

export default Logo;