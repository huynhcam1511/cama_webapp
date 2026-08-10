import { useState, useEffect } from "react";

export function useLayoutScale(targetWidth: number = 1536) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function handleResize() {
      const windowWidth = window.innerWidth;
      // We only scale down if the window is smaller than our target width.
      // 1536px is often a standard breakpoint for '2xl' screens.
      if (windowWidth < targetWidth) {
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
