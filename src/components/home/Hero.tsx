"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "@/constants/colors";

const slides = [
  {
    id: 1,
    image: "/images/IMG_0297.JPG",
    title: "Timeless Elegance",
    subtitle: "Discover our new collection of fine jewelry",
  },
  {
    id: 2,
    image: "/images/IMG_1839.JPG",
    title: "Luxury Defined",
    subtitle: "Handcrafted pieces for every occasion",
  },
  {
    id: 3,
    image: "/images/IMG_1853.JPG",
    title: "Modern Classics",
    subtitle: "Explore our signature collection",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[90vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full"
        >
          <Image
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `${colors.accentDark}50` }}
          >
            <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="space-y-6">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-5xl font-light"
                  style={{ color: colors.textLight }}
                >
                  {slides[currentSlide].title}
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xl text-shadow-light"
                  style={{ color: colors.textLight }}
                >
                  {slides[currentSlide].subtitle}
                </motion.p>
                <button
                  className="px-8 py-3 rounded-md transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="w-2 h-2 rounded-full transition-colors duration-200"
            style={{
              backgroundColor:
                currentSlide === index
                  ? colors.textLight
                  : `${colors.textLight}80`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
