import type { CreditCardFlag as PaymentFlag, PaymentMethod } from "@/types/finance";
import type { SVGProps } from "react";

interface FlagIconProps extends SVGProps<SVGSVGElement> {
  flag: PaymentFlag | PaymentMethod | "boleto" | "debit_card" | "dinheiro" | "transferencia" | "transferência";
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
      <g transform="translate(8, 0) scale(0.711)">
        <path
          fill="#fff"
          d="M39.4 21.7h3.4v-7.9h-3.7v1.1l-.7-1.1h-3.2v1.4l-.6-1.4h-5.9c-.2 0-.4.1-.6.1s-.3.1-.5.2-.3.1-.5.2v-.5H10.2l-.5 1.3-.5-1.3h-4v1.4l-.6-1.4H1.4L0 17.2v4.5h2.3l.4-1.1h.8l.4 1.1h17.6v-1l.7 1h4.9v-.6c.1.1.3.1.4.2s.3.1.4.2c.2.1.4.1.6.1h3.6l.4-1.1h.8l.4 1.1h4.9v-1l.8 1.1zm5.5 10v-7.4H17.4l-.7 1-.7-1H8v7.9h8l.7-1 .7 1h5v-1.7h-.2c.7 0 1.3-.1 1.8-.3v2.1h3.6v-1l.7 1h14.9c.6-.2 1.2-.3 1.7-.6z"
        />
        <path
          fill="#006FCF"
          d="M43.2 29.8h-2.7v1.1h2.6c1.1 0 1.8-.7 1.8-1.7s-.6-1.5-1.6-1.5h-1.2c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h2.3l.5-1.1h-2.7c-1.1 0-1.8.7-1.8 1.6 0 1 .6 1.5 1.6 1.5h1.2c.3 0 .5.2.5.5.1.4-.1.6-.5.6zm-4.9 0h-2.7v1.1h2.6c1.1 0 1.8-.7 1.8-1.7s-.6-1.5-1.6-1.5h-1.2c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h2.3l.5-1.1h-2.7c-1.1 0-1.8.7-1.8 1.6 0 1 .6 1.5 1.6 1.5h1.2c.3 0 .5.2.5.5.1.4-.2.6-.5.6zm-3.5-3.2v-1.1h-4.2v5.3h4.2v-1.1h-3v-1.1h2.9v-1.1h-2.9v-1h3v.1zm-6.8 0c.5 0 .7.3.7.6s-.2.6-.7.6h-1.5v-1.3l1.5.1zm-1.5 2.3h.6l1.6 1.9h1.5l-1.8-2c.9-.2 1.4-.8 1.4-1.6 0-1-.7-1.7-1.8-1.7h-2.8v5.3h1.2l.1-1.9zm-3.2-1.6c0 .4-.2.7-.7.7H21v-1.4h1.5c.5 0 .8.3.8.7zm-3.5-1.8v5.3H21V29h1.6c1.1 0 1.9-.7 1.9-1.8 0-1-.7-1.8-1.8-1.8l-2.9.1zM18 30.8h1.5l-2.1-2.7 2.1-2.6H18l-1.3 1.7-1.3-1.7h-1.5l2.1 2.6-2.1 2.6h1.5l1.3-1.7 1.3 1.8zm-4.5-4.2v-1.1H9.3v5.3h4.2v-1.1h-3v-1.1h2.9v-1.1h-2.9v-1h3v.1zm24.3-9.4l2.1 3.2h1.5v-5.3h-1.2v3.5l-.3-.5-1.9-3h-1.6v5.3h1.2v-3.6l.2.4zm-5.2-.1L33 16l.4 1.1.5 1.2h-1.8l.5-1.2zm2.1 3.3H36l-2.3-5.3h-1.6l-2.3 5.3h1.3l.5-1.1h2.6l.5 1.1zm-5.6 0l.5-1.1h-.3c-.9 0-1.4-.6-1.4-1.5v-.1c0-.9.5-1.5 1.4-1.5h1.3v-1.1h-1.4c-1.6 0-2.5 1.1-2.5 2.6v.1c0 1.6.9 2.6 2.4 2.6zm-4.5 0h1.2v-5.2h-1.2v5.2zM22 16.2c.5 0 .7.3.7.6s-.2.6-.7.6h-1.5v-1.3l1.5.1zm-1.5 2.3h.6l1.6 1.9h1.5l-1.8-2c.9-.2 1.4-.8 1.4-1.6 0-1-.7-1.7-1.8-1.7h-2.8v5.3h1.2l.1-1.9zm-2.2-2.3v-1.1h-4.2v5.3h4.2v-1.1h-3v-1.1h2.9v-1.1h-2.9v-1h3v.1zm-9.1 4.2h1.1l1.5-4.3v4.3H13v-5.3h-2l-1.2 3.6-1.2-3.6h-2v5.3h1.2v-4.3l1.4 4.3zm-6.5-3.3l.4-1.1.4 1.1.5 1.2H2.2l.5-1.2zm2.1 3.3h1.3l-2.3-5.3H2.3L0 20.4h1.3l.5-1.1h2.6l.4 1.1z"
        />
      </g>
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


function PixIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#10B981" />
      <path d="M24 8L30 14L24 20L18 14L24 8Z" fill="white" />
      <path d="M24 12L27.5 15.5L24 19L20.5 15.5L24 12Z" fill="#10B981" />
      <text x="18" y="29" fill="white" fontSize="7" fontWeight="bold">PIX</text>
    </svg>
  );
}

function BoletoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#374151" />
      <rect x="8" y="6" width="32" height="20" rx="2" fill="#F9FAFB" />
      <rect x="12" y="10" width="2" height="12" fill="#111827" />
      <rect x="16" y="10" width="1" height="12" fill="#111827" />
      <rect x="20" y="10" width="2" height="12" fill="#111827" />
      <rect x="25" y="10" width="1" height="12" fill="#111827" />
      <rect x="29" y="10" width="2" height="12" fill="#111827" />
      <rect x="34" y="10" width="1" height="12" fill="#111827" />
    </svg>
  );
}

function CashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#059669" />
      <rect x="6" y="8" width="36" height="16" rx="3" fill="#34D399" />
      <circle cx="24" cy="16" r="4" fill="#047857" />
      <text x="22" y="18.5" fill="white" fontSize="6" fontWeight="bold">$</text>
    </svg>
  );
}

function TransferIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="48" height="32" rx="4" fill="#0EA5E9" />
      <path d="M10 11H30" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 8L30 11L26 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 21H18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 18L18 21L22 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function normalizeFlag(flag: FlagIconProps["flag"]): string {
  const normalized = String(flag).trim().toLowerCase();

  if (normalized === "debit_card") return "debit";
  if (normalized === "dinheiro") return "cash";
  if (normalized === "transferencia" || normalized === "transferência") return "transfer";

  return normalized;
}
export function FlagIcon({ flag, ...props }: FlagIconProps) {
  const iconProps = { width: 40, height: 28, ...props };

  const normalizedFlag = normalizeFlag(flag);
  switch (normalizedFlag) {
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
    case "pix":
      return <PixIcon {...iconProps} />;
    case "boleto":
      return <BoletoIcon {...iconProps} />;
    case "cash":
      return <CashIcon {...iconProps} />;
    case "transfer":
      return <TransferIcon {...iconProps} />;
    case "debit":
      return <OtherCardIcon {...iconProps} />;
    case "credit_card":
      return <OtherCardIcon {...iconProps} />;
    default:
      return <OtherCardIcon {...iconProps} />;
  }
}

