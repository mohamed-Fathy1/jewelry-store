"use client";

import React from "react";
import Image from "next/image";
import { colors } from "@/constants/colors"; // Adjust the import based on your color constants

const TarnishingPromo: React.FC = () => {
  return (
    <div className="max-w-5xl min-h-screen flex items-center mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-5 gap-8 md:gap-2 items-center">
        <div className="order-2 text-center md:text-start md:order-2  md:col-span-3 flex flex-col items-start">
          <h2
            className="text-4xl w-full font-bold mb-4"
            style={{ color: colors.textPrimary }}
          >
            AFRAID OF TARNISHING?
          </h2>
          <p className="text-lg mb-4" style={{ color: colors.textSecondary }}>
            Our accessories are made from high-quality stainless steel material
            that does not change color or rust. You don't have to take it off
            when you take a shower or use water, perfume, and so on.
          </p>
        </div>
        <div className="order-1 md:order-2 md:col-span-2 inline-grid md:block items-center justify-center md:ml-12">
          <div className="w-fit md:w-full relative">
            {/* Bottom image - Necklaces */}
            {/* Top image - Ring, positioned to overlap */}
            <div className="w-[300px] md:w-full">
              <div className="absolute -right-1/4 bottom-1/2 aspect-square w-2/3 max-w-[300px]">
                <Image
                  src="/images/IMG_2953.JPG"
                  alt="Gold ring with opal stone on hand"
                  fill
                  className="object-cover rounded-sm shadow-lg"
                  // sizes="(max-width: 768px) 66vw, 33vw"
                />
              </div>
              <div className="relative mr-auto w-2/3 aspect-[3/4] max-w-[300px]">
                <Image
                  src="/images/IMG_1853.JPG"
                  alt="Gold necklaces with pendant displayed on white surface"
                  fill
                  className="object-cover rounded-sm shadow-lg"
                  // sizes="(max-width: 768px) 66vw, 33vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarnishingPromo;
