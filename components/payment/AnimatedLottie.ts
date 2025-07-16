// components/ui/AnimatedLottie.tsx
import React, { useEffect, useRef } from "react";
import LottieView from "lottie-react-native";
import { View, StyleSheet } from "react-native";

interface AnimatedLottieProps {
  source: any; // JSON path (imported)
  autoPlay?: boolean;
  loop?: boolean;
  width?: number;
  height?: number;
  playFromFrame?: number;
  playToFrame?: number;
}

export default function AnimatedLottie({
  source,
  autoPlay = true,
  loop = true,
  width = 250,
  height = 250,
  playFromFrame,
  playToFrame,
}: AnimatedLottieProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (animationRef.current) {
      if (playFromFrame !== undefined && playToFrame !== undefined) {
        animationRef.current.play(playFromFrame, playToFrame);
      } else {
        animationRef.current.play();
      }
    }
  }, [playFromFrame, playToFrame]);

  return <LottieView ref={animationRef} source={source} autoPlay={autoPlay} loop={loop} style={{ width, height }} />;
}
