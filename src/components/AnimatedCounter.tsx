/**
 * Animated counter component
 */

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export const AnimatedCounter = ({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
}: AnimatedCounterProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    if (isVisible) {
      spring.set(value);
    }
  }, [spring, value, isVisible]);

  return (
    <motion.span
      onViewportEnter={() => setIsVisible(true)}
      viewport={{ once: true, margin: "-100px" }}
    >
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
};
