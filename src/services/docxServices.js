import { Document } from 'docx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';

export const convertDOCXtoPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert DOCX to HTML first using mammoth for better text extraction
    const result = await mammoth.extractRawText({arrayBuffer});
    const text = result.value;
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { height, width } = page.getSize();
    const fontSize = 12;
    const lineHeight = fontSize * 1.5;
    const margin = 50;
    let yPosition = height - margin;

    // Get the font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Split text into paragraphs and handle text wrapping
    const paragraphs = text.split('\n').filter(p => p.trim());
    
    for (const paragraph of paragraphs) {
      // Check if we need a new page
      if (yPosition < margin + fontSize) {
        page = pdfDoc.addPage();
        yPosition = height - margin;
      }

      // Word wrap text
      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > width - (margin * 2)) {
          // Draw current line and move to next line
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
          currentLine = word;

          // Check if we need a new page
          if (yPosition < margin + fontSize) {
            page = pdfDoc.addPage();
            yPosition = height - margin;
          }
        } else {
          currentLine = testLine;
        }
      }

      // Draw remaining text in the current line
      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight * 1.2; // Add extra space between paragraphs
      }
    }

    // Save and download PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.docx', '')}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error converting DOCX to PDF:', error);
    throw error;
  }
};