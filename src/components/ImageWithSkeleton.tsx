"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export default function ImageWithSkeleton({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`image-skeleton-wrapper ${className}`.trim()} style={{ position: "relative", width, height }}>
      {!loaded && (
        <div
          className="skeleton-pulse"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
          }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        unoptimized
        onLoad={() => setLoaded(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}
