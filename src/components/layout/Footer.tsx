import Image from "next/image";
import { colors } from "@/constants/colors";

export default function Footer() {
  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { name: "Shipping", href: "/shipping" },
        { name: "Returns", href: "/returns" },
        { name: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer
      className="border-t bg-white"
      style={{
        borderColor: colors.border,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
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

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: colors.textPrimary }}
              >
                {section.title}
              </h3>
              <ul className="mt-4 space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="transition-colors duration-200"
                      style={{ color: colors.textSecondary }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div
          className="mt-12 border-t pt-8"
          style={{ borderColor: colors.border }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: colors.textPrimary }}
          >
            Subscribe to our newsletter
          </h3>
          <form className="mt-4 sm:flex sm:max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            />
            <button
              type="submit"
              className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto px-6 py-2 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              Subscribe
            </button>
          </form>
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
            © {new Date().getFullYear()} LUXE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
