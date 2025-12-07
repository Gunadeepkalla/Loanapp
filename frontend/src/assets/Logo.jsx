import React from 'react';
import logoImg from './Logo.jpg';

const SIZE_CLASS = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10'
};

const Logo = ({ size = 'md', alt = 'Logo', className = '' }) => {
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;
  return (
    <img
      src={logoImg}
      alt={alt}
      className={`${sizeClass} ${className}`}
    />
  );
};

export default Logo;
