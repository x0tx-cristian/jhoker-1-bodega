// src/components/icons/EditIcon.tsx
import React from "react";

export const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 20 20"
    width="1em"
    {...props}
  >
    <path
      d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.7834 4.90002 15.6584L7.60002 15.325C7.97502 15.2834 8.50835 15.0417 8.77502 14.775L15.6167 7.53335C16.9667 6.10835 17.3167 4.71668 15.9083 3.36668C14.5 2.01668 13.1083 2.36668 11.7583 3.71668L11.05 4.42502" // Simplified path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5} // Adjusted strokeWidth if needed
    />
     <path
      d="M9.90833 5.05835C10.2083 7.04168 11.7 8.47501 13.6917 8.77501" // Simplified path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5} // Adjusted strokeWidth if needed
    />
    {/* Add other paths if necessary */}
  </svg>
);