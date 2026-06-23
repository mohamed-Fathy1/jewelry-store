import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppIcon: React.FC = () => {
  return (
    <a
      href="https://wa.me/201044698713"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-on-primary shadow-card-hover ring-1 ring-accent/40 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:bottom-7 sm:right-7"
    >
      <FaWhatsapp className="h-6 w-6" aria-hidden="true" />
    </a>
  );
};

export default WhatsAppIcon;
