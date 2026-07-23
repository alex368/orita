import icon from "../../assets/orita-icon.jpg";
import wordmark from "../../assets/orita-logo.jpg";

type BrandLogoProps = {
  compact?: boolean;
  invert?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, invert = false, className = "" }: BrandLogoProps) {
  if (compact) {
    return (
      <span className={`inline-flex items-center justify-center overflow-hidden rounded-md bg-black ring-1 ${invert ? "ring-white/15" : "ring-black/10"} ${className}`}>
        <img src={icon} alt="ORITA" className="h-full w-full object-cover" />
      </span>
    );
  }

    return (
      <span className={`inline-flex items-center overflow-hidden rounded-md bg-black ring-1 ${invert ? "ring-white/15" : "ring-black/10"} ${className}`}>
        <img src={wordmark} alt="ORITA" className="h-full w-full object-contain" />
      </span>
    );
  }
