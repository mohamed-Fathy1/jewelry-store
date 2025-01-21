"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { heroService } from "@/services/hero.service";

function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-[600px] bg-gray-200 rounded-lg"></div>
    </div>
  );
}

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState<{ mediaUrl: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await heroService.getHeroImages();
        if (response.success) {
          setImages(response.data.imageSlider.map((item) => item.image));
        }
      } catch (error) {
        console.error("Failed to fetch hero images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return <HeroSkeleton />;
  }

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
          {images.length ? (
            <Image
              src={images[currentSlide].mediaUrl}
              alt={`Hero Slide ${currentSlide + 1}`}
              fill
              priority
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black bg-opacity-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="max-w-xl">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl sm:text-5xl font-light mb-4"
                  style={{ color: colors.textLight }}
                >
                  Discover Timeless Elegance
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg mb-8"
                  style={{ color: colors.textLight }}
                >
                  Explore our curated collection of fine jewelry
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/shop"
                    className="inline-block px-8 py-3 rounded-md text-sm transition-colors duration-200"
                    style={{
                      backgroundColor: colors.brown,
                      color: colors.textLight,
                    }}
                  >
                    Shop Now
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {images.length > 0 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 hover:bg-white/10"
            style={{ color: colors.textLight }}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 hover:bg-white/10"
            style={{ color: colors.textLight }}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentSlide === index ? "w-4 bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
