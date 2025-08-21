import { SVGProps } from "react";

export default function ErrorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 49"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M30 18.1445L18 30.1445M18 18.1445L30 30.1445M44 24.1445C44 35.1902 35.0457 44.1445 24 44.1445C12.9543 44.1445 4 35.1902 4 24.1445C4 13.0988 12.9543 4.14453 24 4.14453C35.0457 4.14453 44 13.0988 44 24.1445Z"
        stroke="#EF5350"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
