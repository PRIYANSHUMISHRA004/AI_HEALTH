"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export function InteractiveCard({ children, className }: InteractiveCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.985, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 24, mass: 0.7 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
