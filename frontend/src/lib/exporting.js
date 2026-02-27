// frontend/src/lib/exporting.js
//
// Export a DOM element as a multi-page PDF and/or print.
// Uses html2canvas + jsPDF.
// Notes:
// - For PRINT we call window.print() and rely on print CSS (.no-print etc).
// - For PDF we capture the element as an image and paginate.

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportElementToPdf(element, fileName = "report.pdf") {
  if (!element) throw new Error("exportElementToPdf: element is null");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Fit image width to page width.
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // First page
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  // If content is longer than one page, add pages by shifting Y up.
  let remaining = imgHeight - pageHeight;
  let offsetY = -pageHeight;

  while (remaining > 0) {
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, offsetY, imgWidth, imgHeight);
    remaining -= pageHeight;
    offsetY -= pageHeight;
  }

  pdf.save(fileName);
}

export function printPage() {
  window.print();
}

/**
 * Ask export target if exportMode == "ASK".
 * Returns "PDF" | "PRINT" | null.
 */
export async function chooseExportTarget() {
  // Replace with a nicer modal later if you want.
  const answer = window
    .prompt("Type PDF or PRINT", "PDF")
    ?.trim()
    .toUpperCase();

  if (answer === "PRINT") return "PRINT";
  if (answer === "PDF") return "PDF";
  return null;
}