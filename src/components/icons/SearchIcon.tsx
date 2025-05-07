// src/components/icons/SearchIcon.tsx
import React from "react";
export const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation"
        viewBox="0 0 24 24" width="1em" strokeWidth="2" stroke="currentColor" {...props} // Ajustado strokeWidth
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);