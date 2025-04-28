import React from "react";
import LogoImage from "@/assets/logo_misericordia.svg"; // Assicurati di importare il file SVG

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "size-24",
  };

  return (
    <div className={`text-secondary ${sizeClasses[size]} ${className}`}>
      <img src={LogoImage} alt="Logo Misericordia" className="w-full h-full" />
    </div>
  );
};

export default Logo;
