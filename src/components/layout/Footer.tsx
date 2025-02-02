import Image from "next/image";
import { colors } from "@/constants/colors";

export default function Footer() {
  return (
    <footer
      className="border-t bg-white py-5"
      style={{
        borderColor: colors.border,
      }}
    >
      <div className="w-fit mx-6 md:mx-auto">
        <h3
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          <Image
            src="/logo.jpg"
            alt="Luxury Jewelry Store Logo"
            width={60}
            height={60}
            className="h-8 w-auto"
          />
        </h3>
        <p className="mt-4" style={{ color: colors.textSecondary }}>
          Crafting timeless elegance through exceptional jewelry pieces.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Social Media Links */}
        <div className="flex justify-center space-x-4">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 aspect-square w-12 h-12 rounded-full border-2"
            style={{
              borderColor: colors.textSecondary,
            }}
          >
            <svg
              fill={colors.textPrimary}
              viewBox="0 0 512.00 512.00"
              stroke={colors.textPrimary}
              strokeWidth="0.00512"
              className="w-full"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <title>ionicons-v5_logos</title>
                <path d="M349.33,69.33a93.62,93.62,0,0,1,93.34,93.34V349.33a93.62,93.62,0,0,1-93.34,93.34H162.67a93.62,93.62,0,0,1-93.34-93.34V162.67a93.62,93.62,0,0,1,93.34-93.34H349.33m0-37.33H162.67C90.8,32,32,90.8,32,162.67V349.33C32,421.2,90.8,480,162.67,480H349.33C421.2,480,480,421.2,480,349.33V162.67C480,90.8,421.2,32,349.33,32Z"></path>
                <path d="M377.33,162.67a28,28,0,1,1,28-28A27.94,27.94,0,0,1,377.33,162.67Z"></path>
                <path d="M256,181.33A74.67,74.67,0,1,1,181.33,256,74.75,74.75,0,0,1,256,181.33M256,144A112,112,0,1,0,368,256,112,112,0,0,0,256,144Z"></path>
              </g>
            </svg>
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 aspect-square w-12 h-12 rounded-full border-2"
            style={{
              borderColor: colors.textSecondary,
            }}
          >
            <svg
              fill={colors.textPrimary}
              version="1.1"
              viewBox="0 0 512 512"
              className="w-full"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <g id="7935ec95c421cee6d86eb22ecd11b7e3">
                  {" "}
                  <path
                    style={{ display: "inline" }}
                    d="M283.122,122.174c0,5.24,0,22.319,0,46.583h83.424l-9.045,74.367h-74.379 c0,114.688,0,268.375,0,268.375h-98.726c0,0,0-151.653,0-268.375h-51.443v-74.367h51.443c0-29.492,0-50.463,0-56.302 c0-27.82-2.096-41.02,9.725-62.578C205.948,28.32,239.308-0.174,297.007,0.512c57.713,0.711,82.04,6.263,82.04,6.263 l-12.501,79.257c0,0-36.853-9.731-54.942-6.263C293.539,83.238,283.122,94.366,283.122,122.174z"
                  >
                    {" "}
                  </path>{" "}
                </g>{" "}
              </g>
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <div
          className="mt-8 border-t pt-8"
          style={{ borderColor: colors.border }}
        >
          <p
            className="text-sm text-center"
            style={{ color: colors.textSecondary }}
          >
            © {new Date().getFullYear()} Atozaccessories.
          </p>
        </div>
      </div>
    </footer>
  );
}
