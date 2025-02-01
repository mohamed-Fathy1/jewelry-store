import React from "react";
import "./LoadingSpinner.css"; // Assuming you will create a CSS file for styles

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <img
        src="/logo.jpg"
        alt="Loading..."
        className="loading-logo animate-pulse rounded-full"
      />
      <div className="dots">
        <div className="dot-flashing"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
