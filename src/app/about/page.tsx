"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./about.module.css";
import { colors } from "@/constants/colors";

export default function AboutPage() {
  return (
    <div className={styles.aboutContainer}>
      {/* Hero Section */}
      <motion.div
        className={styles.heroSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/images/IMG_0297.JPG"
          alt="Stainless steel jewelry collection"
          fill
          className={styles.heroImage}
          priority
        />
        <div className={styles.heroOverlay}>
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-shadow-light"
          >
            About A to Z Accessories
          </motion.h1>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className={styles.contentSection}>
        <motion.div
          className={styles.textContent}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p>
            At A to Z accessories, we specialize in high-quality stainless steel
            accessories designed to withstand the test of time. Our products are
            engineered to resist rust and color change, making them the perfect
            choice for those who value durability, style, and functionality.
          </p>

          <p>
            We're passionate about providing you with accessories that not only
            look great but are built to last – no matter the conditions.
          </p>

          <p>
            Our stainless steel accessories are ideal for everyday wear,
            offering an unbeatable combination of strength and elegance.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className={styles.featuresGrid}>
          <motion.div
            className={styles.featureCard}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Image
              src="/images/IMG_3095.JPG"
              alt="Durability icon"
              width={64}
              height={64}
            />
            <div
              className="absolute inset-0 transition-opacity duration-300 opacity-50 group-hover:opacity-40"
              style={{ backgroundColor: colors.accentDark }}
            />
            <h3>Durability</h3>
            <p>Built to last a lifetime</p>
          </motion.div>

          <motion.div
            className={styles.featureCard}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <Image
              src="/images/IMG_3177.PNG"
              alt="Rust resistant icon"
              width={64}
              height={64}
            />
            <div
              className="absolute inset-0 transition-opacity duration-300 opacity-50 group-hover:opacity-40"
              style={{ backgroundColor: colors.accentDark }}
            />
            <h3>Rust Resistant</h3>
            <p>Always maintains its shine</p>
          </motion.div>

          <motion.div
            className={styles.featureCard}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <Image
              src="/images/IMG_1858.JPG"
              alt="Style icon"
              width={64}
              height={64}
            />
            <div
              className="absolute inset-0 transition-opacity duration-300 opacity-50 group-hover:opacity-40"
              style={{ backgroundColor: colors.accentDark }}
            />
            <h3>Timeless Style</h3>
            <p>Classic designs that never fade</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
