import React, { useMemo } from "react";
import katex from "katex";

interface MathViewProps {
  math: string;
  display?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Renders LaTeX mathematical expressions cleanly and reliably using KaTeX.
 * Supports both display mode (centered block) and inline mode.
 */
export const MathView: React.FC<MathViewProps> = ({
  math,
  display = false,
  className = "",
  ariaLabel,
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        output: "htmlAndMathml",
      });
    } catch (err) {
      console.warn("KaTeX render error:", err);
      return math;
    }
  }, [math, display]);

  return (
    <span
      className={`katex-wrapper ${display ? "block my-1 text-center" : "inline-block align-middle"} ${className}`}
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

