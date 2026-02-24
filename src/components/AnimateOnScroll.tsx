"use client";

import { useRef, useEffect, ReactNode } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right";
  delay?: number;
}

export default function AnimateOnScroll({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  const animationClass =
    animation === "fade-up" ? "" : `animate-${animation}`;

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${animationClass} ${className}`.trim()}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}
