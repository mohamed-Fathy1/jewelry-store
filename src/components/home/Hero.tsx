"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { heroService } from "@/services/hero.service";
import { HeroSlider } from "@/types/hero.types";

function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-[600px] bg-gray-200 rounded-lg"></div>
    </div>
  );
}

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliders, setSliders] = useState<HeroSlider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await heroService.getHeroImages();
        if (response.success) {
          setSliders(response.data.imageSlider);
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
    if (sliders.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [sliders.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  if (isLoading) {
    return <HeroSkeleton />;
  }

  if (!sliders.length) {
    return null;
  }

  const currentSlider = sliders[currentSlide];

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
          {/* Small Screen Image */}
          <div className="block md:hidden relative h-full">
            <Image
              src={currentSlider.images.image1.mediaUrl}
              alt={`Hero Slide ${currentSlide + 1}`}
              fill
              priority
              sizes="100vw"
              quality={85}
              className="object-cover"
            />
          </div>

          {/* Large Screen Image */}
          <div className="hidden md:block relative h-full">
            <Image
              src={currentSlider.images.image2.mediaUrl}
              alt={`Hero Slide ${currentSlide + 1}`}
              fill
              priority
              sizes="100vw"
              quality={90}
              className="object-cover"
            />
          </div>

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

      {sliders.length > 1 && (
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
            {sliders.map((_, index) => (
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
