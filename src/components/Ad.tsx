import React from 'react';

const Ad: React.FC = () => {
  return (
    <div className="my-8">
      <a href="#" target="_blank" rel="noopener noreferrer">
        <img 
          src="/starlinkanuncio.jpg" 
          alt="Anúncio Starlink" 
          className="w-full rounded-lg shadow-md hover:opacity-90 transition-opacity"
        />
      </a>
    </div>
  );
};

export default Ad;