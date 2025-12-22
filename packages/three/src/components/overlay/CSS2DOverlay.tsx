import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { CSS2DObject } from "three-stdlib";
import type { CSS2DOverlayProps } from "../../types/overlay";

export function CSS2DOverlay({ position, children, className }: CSS2DOverlayProps) {
  const { scene } = useThree();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const label = new CSS2DObject(divRef.current);

    if (Array.isArray(position)) {
      label.position.set(...position);
    } else {
      label.position.copy(position);
    }

    scene.add(label);

    return () => {
      scene.remove(label);
      label.element.remove();
    };
  }, [scene, position]);

  return (
    <div ref={divRef} className={className}>
      {children}
    </div>
  );
}
