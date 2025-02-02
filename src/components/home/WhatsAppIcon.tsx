import React from "react";
import { FaWhatsapp } from "react-icons/fa"; // Make sure to install react-icons
import './WhatsAppIcon.css'; // Import the CSS file

const WhatsAppIcon: React.FC = () => {
  return (
    <a
      href="https://wa.me/your-number" // Replace with your WhatsApp number
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-icon block z-[9999]"
    >
      <FaWhatsapp size={30} color="#fff" />
    </a>
  );
};

export default WhatsAppIcon;
