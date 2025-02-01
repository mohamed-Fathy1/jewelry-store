"use client";

import React, { useState, useEffect } from "react";
import { colors } from "@/constants/colors"; // Adjust the import based on your color constants

const offers = [
  {
    message: "🎉 Buy 3 of Your Favorite Bracelets and Enjoy Free Shipping! 🚚",
  },
  {
    message: "💰 Spend 1500 EGP and Get 10% Off + Free Shipping! 🎊",
  },
];

const PromoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true); // Start fade out
      setTimeout(() => {
        setCurrentOfferIndex((prevIndex) =>
          prevIndex === offers.length - 1 ? 0 : prevIndex + 1
        );
        setFade(false); // Start fade in
      }, 500); // Match this duration with the CSS transition duration
    }, 5000); // Change offer every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  if (!isVisible) return null; // Don't render if not visible

  return (
    <div
      className="flex justify-between items-center p-4 md:px-6 lg:px-7 xl:px-10"
      style={{
        backgroundColor: colors.brown,
        color: colors.textLight,
      }}
    >
      <span
        className={`text-lg font-semibold transition-opacity duration-500 ${
          fade ? "opacity-0" : "opacity-100"
        }`}
      >
        {offers[currentOfferIndex].message}
      </span>
      <button
        className="text-lg font-semibold"
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: colors.textLight,
        }}
        onClick={() => setIsVisible(false)} // Close the banner
      >
        &times; {/* Close icon */}
      </button>
    </div>
  );
};

export default PromoBanner;
