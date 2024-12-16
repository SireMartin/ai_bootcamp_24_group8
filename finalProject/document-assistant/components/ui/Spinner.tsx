import React from 'react';

const Spinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`spinner ${className}`}>
      <style jsx>{`
        .spinner {
          display: inline-block;
          width: 1em;
          height: 1em;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Spinner; 