import { SVGProps } from "react";

export default function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 12.1445L11 14.1445L15 10.1445M22 12.1445C22 17.6674 17.5228 22.1445 12 22.1445C6.47715 22.1445 2 17.6674 2 12.1445C2 6.62168 6.47715 2.14453 12 2.14453C17.5228 2.14453 22 6.62168 22 12.1445Z"
        stroke="#3BA55C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
