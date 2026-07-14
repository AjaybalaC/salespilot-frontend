import clsx from "clsx";

interface Props {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const widths = { sm: "max-w-3xl", md: "max-w-5xl", lg: "max-w-7xl", xl: "max-w-[90rem]", full: "max-w-full" };

export default function PageContainer({ children, maxWidth = "lg", className }: Props) {
  return <div className={clsx("mx-auto w-full px-4 py-8 sm:px-6 lg:px-8", widths[maxWidth], className)}>{children}</div>;
}