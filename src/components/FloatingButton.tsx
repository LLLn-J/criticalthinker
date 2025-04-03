import React from 'react';

interface FloatingButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick, isActive = false }) => {
  return (
    <button
      className={`critical-thinker-floating-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
      aria-label={isActive ? "Close Critical Thinking Questions" : "Open Critical Thinking Questions"}
      title="Critical Thinking Questions"
    >
      <span role="img" aria-label="brain">
        🧠
      </span>
    </button>
  );
};

export default FloatingButton; 