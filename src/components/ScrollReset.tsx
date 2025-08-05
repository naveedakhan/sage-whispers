import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollReset() {
  const location = useLocation();

  useEffect(() => {
    // Reset body scroll lock (in case menu left it locked)
    document.body.style.overflow = "auto";
  }, [location]);

  return null;
}
