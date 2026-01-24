import React from 'react';

const OledLoader = () => {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black">
      <div className="flex space-x-3">
        <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:0.15s]"></div>
      </div>
    </div>
  );
};

export default OledLoader;

