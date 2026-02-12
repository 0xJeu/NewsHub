"use client";

import { useEffect } from "react";

/**
 * Component to remove Grammarly browser extension interference
 * Grammarly can interfere with contenteditable elements and forms
 */
export default function RemoveGrammarly() {
  useEffect(() => {
    // Remove Grammarly extension attributes from the document
    const removeGrammarlyAttributes = () => {
      const grammarlyElements = document.querySelectorAll(
        '[data-grammarly-shadow-root], grammarly-extension, grammarly-desktop-integration'
      );
      
      grammarlyElements.forEach((element) => {
        element.remove();
      });

      // Remove Grammarly data attributes from body
      if (document.body) {
        document.body.removeAttribute('data-grammarly-shadow-root');
        document.body.removeAttribute('data-gr-ext-installed');
      }
    };

    // Run on mount
    removeGrammarlyAttributes();

    // Run periodically to catch dynamically added elements
    const interval = setInterval(removeGrammarlyAttributes, 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
