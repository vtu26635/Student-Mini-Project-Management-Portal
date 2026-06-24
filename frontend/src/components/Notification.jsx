import React from 'react';

export default function Notification({ message, type, onClose }) {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-rose-500' : 'bg-emerald-500';
  
  return (
    <div className={`fixed bottom-5 right-5 text-white px-5 py-3.5 rounded-xl shadow-xl ${bgColor} transition-all duration-300 z-50 animate-fade-in font-medium text-sm flex items-center gap-3`}>
      <span>{message}</span>
      <button onClick={onClose} className="font-bold hover:opacity-75 border-l border-white/30 pl-2.5 ml-1">
        ✕
      </button>
    </div>
  );
}