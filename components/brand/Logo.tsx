import Image from "next/image";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
};

export function Logo({
  variant = "full",
  className = "",
  priority = false,
}: LogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/brand/myelin-logo.png"
        alt="Myelin"
        width={40}
        height={40}
        className={`h-9 w-9 object-contain object-top ${className}`}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src="/brand/myelin-logo.png"
      alt="Myelin"
      width={160}
      height={160}
      className={`h-auto w-auto object-contain ${className}`}
      priority={priority}
    />
  );
}
