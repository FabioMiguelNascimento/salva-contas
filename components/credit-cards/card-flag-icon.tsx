import type { CreditCardFlag } from "@/types/finance";
import type { SVGProps } from "react";

interface CardFlagIconProps extends SVGProps<SVGSVGElement> {
  flag: CreditCardFlag;
}

function VisaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <path
        d="M19.5 21H17L18.9 11H21.4L19.5 21ZM15.3 11L12.9 17.9L12.6 16.5L11.7 12C11.7 12 11.6 11 10.3 11H6.1L6 11.2C6 11.2 7.5 11.5 9.2 12.5L11.4 21H14L18 11H15.3ZM35.7 21H38L36 11H34C32.9 11 32.6 11.8 32.6 11.8L28.5 21H31.2L31.7 19.5H35L35.7 21ZM32.5 17.3L33.9 13.5L34.7 17.3H32.5ZM28.5 13.8L28.9 11.3C28.9 11.3 27.6 11 26.2 11C24.7 11 21.1 11.6 21.1 14.7C21.1 17.6 25.2 17.6 25.2 19.1C25.2 20.6 21.5 20.3 20.3 19.4L19.9 22C19.9 22 21.2 22.5 23.2 22.5C25.2 22.5 28.4 21.4 28.4 18.6C28.4 15.7 24.3 15.5 24.3 14.2C24.3 12.9 27.2 13.1 28.5 13.8Z"
        fill="white"
      />
    </svg>
  );
}

function MastercardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#F5F5F5" />
      <circle cx="18" cy="16" r="10" fill="#EB001B" />
      <circle cx="30" cy="16" r="10" fill="#F79E1B" />
      <path
        d="M24 8.5C26.4 10.3 28 13 28 16C28 19 26.4 21.7 24 23.5C21.6 21.7 20 19 20 16C20 13 21.6 10.3 24 8.5Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function AmexIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#006FCF" />
      <path
        d="M8 20H10L10.5 18.5H12.5L13 20H17V18.3L17.4 20H19.5L19.9 18.3V20H32V18.2L32.5 20H35.5L36 18.2V20H40V12H36.3L35.8 13.7V12H32L31.4 13.8L30.9 12H20V13.6L19.5 12H16.5L16 13.6V12H10.5L9.5 14.5L8.5 12H5V20H8ZM33.5 13.5H35.5L37.5 18.5V13.5H39.5L40.5 16.5L41.5 13.5H43.5V18.5H42L42 14.5L40.8 18.5H39.3L38 14.5V18.5H35L34.5 17H32.5L32 18.5H30L33.5 13.5ZM33 16L33.5 14.5L34 16H33ZM24 13.5H29V14.8H25.5V15.5H29V16.8H25.5V17.5H29V18.5H24V13.5ZM18 13.5H20.5L22 17L23.5 13.5H26V18.5H24.5V14.8L22.8 18.5H21.2L19.5 14.8V18.5H17L16.5 17H14.5L14 18.5H12L15.5 13.5H18ZM15 16L15.5 14.5L16 16H15ZM10 13.5H12L14 18.5H12L11.5 17H9.5L9 18.5H7L10 13.5ZM10 16L10.5 14.5L11 16H10Z"
        fill="white"
      />
    </svg>
  );
}

function EloIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#000000" />
      <path
        d="M15 10C15 10 12 11 12 14C12 17 15 18 15 18"
        stroke="#FFCB05"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="16" r="6" fill="#00A4E0" />
      <path
        d="M33 10C33 10 36 11 36 14C36 17 33 18 33 18"
        stroke="#EF4123"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="20" y="19" fill="white" fontSize="8" fontWeight="bold">
        elo
      </text>
    </svg>
  );
}

function HipercardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#822124" />
      <circle cx="24" cy="16" r="8" fill="#FFFFFF" />
      <circle cx="24" cy="16" r="5" fill="#822124" />
      <text x="10" y="28" fill="white" fontSize="6" fontWeight="bold">
        HIPERCARD
      </text>
    </svg>
  );
}

function OtherCardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#6B7280" />
      <rect x="6" y="10" width="36" height="4" rx="1" fill="#9CA3AF" />
      <rect x="6" y="18" width="20" height="3" rx="1" fill="#9CA3AF" />
      <rect x="30" y="18" width="12" height="3" rx="1" fill="#9CA3AF" />
    </svg>
  );
}

export function CardFlagIcon({ flag, ...props }: CardFlagIconProps) {
  const iconProps = { width: 40, height: 28, ...props };

  switch (flag) {
    case "visa":
      return <VisaIcon {...iconProps} />;
    case "mastercard":
      return <MastercardIcon {...iconProps} />;
    case "american_express":
      return <AmexIcon {...iconProps} />;
    case "elo":
      return <EloIcon {...iconProps} />;
    case "hipercard":
      return <HipercardIcon {...iconProps} />;
    default:
      return <OtherCardIcon {...iconProps} />;
  }
}
