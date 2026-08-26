import { useState, useEffect } from "react";

export function useLayoutScale(targetWidth: number = 1536) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function handleResize() {
      const windowWidth = window.innerWidth;
      // We only scale down if the window is smaller than our target width,
      // but we STOP scaling for mobile/tablet screens (< 1024px) because they
      // should use Tailwind's responsive stacking (grid-cols-1, flex-col) instead.
      if (windowWidth < targetWidth && windowWidth >= 1024) {
        const newScale = windowWidth / targetWidth;
        setScale(newScale);
      } else {
        setScale(1);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [targetWidth]);

  return scale;
}
