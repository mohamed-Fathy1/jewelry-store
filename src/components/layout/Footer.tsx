import Image from "next/image";
import Link from "next/link";
import { colors } from "@/constants/colors";
import { FaWhatsapp } from "react-icons/fa";

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
            alt="Atozaccessories Jewelry Store"
            width={60}
            height={60}
            className="h-8 w-auto"
          />
        </h3>
        <p className="mt-4" style={{ color: colors.textSecondary }}>
          Crafting timeless elegance through exceptional jewelry pieces.
        </p>
      </div>

      {/* Quick Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="flex flex-col items-center justify-center">
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: colors.textPrimary }}
            >
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm hover:underline"
                  style={{ color: colors.textSecondary }}
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          {/* Social Media */}
          <div className="flex flex-col items-center justify-center">
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: colors.textPrimary }}
            >
              Connect With Us
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/a.to.zaccessories"
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
                href="https://wa.me/201044698713"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-[10px] pt-[7px] pb-[9px] aspect-square w-12 h-12 rounded-full border-2"
                style={{
                  borderColor: colors.textSecondary,
                }}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 448 512"
                  color="#8B4513"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: "rgb(139, 69, 19)" }}
                  className="w-full"
                >
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                </svg>
              </a>
            </div>
          </div>
          {/* Customer Service */}
          <div className="flex flex-col items-center justify-center">
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: colors.textPrimary }}
            >
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/exchange-policy"
                  className="text-sm hover:underline"
                  style={{ color: colors.textSecondary }}
                >
                  Refunds & Exchanges
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-8" style={{ borderColor: colors.border }}>
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
