"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";

type MediaImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  overlay?: "soft" | "dark" | "teal" | "none";
};

export function MediaImage({
  src,
  alt,
  className,
  imageClassName,
  priority,
  sizes = "(max-width: 768px) 100vw, 50vw",
  overlay = "none",
}: MediaImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-bg-soft", className)}>
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{
          scale: loaded ? 1 : 1.08,
          opacity: loaded ? 1 : 0,
        }}
        transition={{ duration: 1.1, ease: easeOut }}
        className="absolute inset-0"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
      {overlay === "soft" && (
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
      )}
      {overlay === "dark" && (
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-charcoal/10" />
      )}
      {overlay === "teal" && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand/25 via-transparent to-charcoal/30" />
      )}
    </div>
  );
}

/** Portrait with caption — character storytelling */
export function CharacterCard({
  src,
  name,
  role,
  quote,
  className,
}: {
  src: string;
  name: string;
  role: string;
  quote: string;
  className?: string;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.8, ease: easeOut }}
      whileHover={{ y: -4 }}
      className={cn("group overflow-hidden rounded-[1.75rem]", className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <MediaImage
          src={src}
          alt={name}
          overlay="dark"
          className="absolute inset-0"
          imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-brand-bright">
            {role}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">{name}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/75">{quote}</p>
        </figcaption>
      </div>
    </motion.figure>
  );
}
