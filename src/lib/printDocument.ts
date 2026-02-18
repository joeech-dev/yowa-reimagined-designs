/**
 * Utility to print billing documents with proper styling.
 * Extracts computed styles from the DOM to ensure print fidelity.
 */
export const printDocument = (ref: HTMLDivElement | null, title: string) => {
  if (!ref) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  // Clone the node so we can inline styles
  const clone = ref.cloneNode(true) as HTMLElement;

  // Walk the original DOM and copy computed styles to cloned elements
  const origElements = ref.querySelectorAll("*");
  const cloneElements = clone.querySelectorAll("*");

  origElements.forEach((origEl, i) => {
    const cloneEl = cloneElements[i] as HTMLElement;
    if (!cloneEl) return;
    const computed = window.getComputedStyle(origEl);
    const important = [
      "background-color", "background-image", "background",
      "color", "font-family", "font-size", "font-weight", "font-style",
      "text-align", "text-decoration", "text-transform",
      "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
      "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
      "border", "border-top", "border-right", "border-bottom", "border-left",
      "border-radius", "border-collapse",
      "display", "flex-direction", "justify-content", "align-items", "gap",
      "width", "max-width", "min-width", "height", "min-height",
      "line-height", "letter-spacing",
      "white-space", "word-break", "overflow",
      "position", "top", "right", "bottom", "left",
      "grid-template-columns", "grid-column",
      "box-sizing", "vertical-align",
    ];
    important.forEach((prop) => {
      const val = computed.getPropertyValue(prop);
      if (val) {
        cloneEl.style.setProperty(prop, val);
      }
    });
  });

  // Also inline on the root clone
  const rootComputed = window.getComputedStyle(ref);
  ["background-color", "color", "font-family", "font-size", "padding", "max-width", "min-height", "margin", "box-sizing"].forEach((prop) => {
    const val = rootComputed.getPropertyValue(prop);
    if (val) clone.style.setProperty(prop, val);
  });

  printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4; margin: 10mm; }
  }
  img { max-width: 100%; height: auto; }
  table { border-collapse: collapse; width: 100%; }
</style></head><body>
${clone.outerHTML}
</body></html>`);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 600);
};
