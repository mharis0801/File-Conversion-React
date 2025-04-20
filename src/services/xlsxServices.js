import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const convertXLSXtoPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    // Create PDF document with landscape orientation
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([842, 595]); // A4 landscape dimensions (width, height)
    const { width, height } = page.getSize();
    const fontSize = 10;
    const margin = 50;
    let yPosition = height - margin;
    
    // Get the font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length === 0) continue;

      // Calculate column widths
      const columnWidths = [];
      const tableWidth = width - (margin * 2);
      const maxColumns = Math.max(...data.map(row => row.length));
      
      // Initialize column widths based on content
      for (let col = 0; col < maxColumns; col++) {
        const columnContent = data.map(row => String(row[col] || ''));
        const maxWidth = Math.max(...columnContent.map(cell => 
          font.widthOfTextAtSize(cell, fontSize)
        ));
        columnWidths[col] = Math.min(maxWidth + 10, tableWidth / maxColumns); // Distribute width evenly
      }

      // Normalize column widths to fit page
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      if (totalWidth > tableWidth) {
        const ratio = tableWidth / totalWidth;
        columnWidths.forEach((width, i) => {
          columnWidths[i] = width * ratio;
        });
      }

      // Calculate total table width including all columns
      const totalTableWidth = columnWidths.reduce((sum, width) => sum + width, 0);

      // Add sheet name
      if (yPosition < margin + fontSize * 4) {
        page = pdfDoc.addPage([842, 595]); // Keep landscape for new pages
        yPosition = height - margin;
      }
      
      page.drawText(sheetName, {
        x: margin,
        y: yPosition,
        size: fontSize + 4,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= fontSize * 3;

      // Draw table
      let tableStartY = yPosition;
      const cellPadding = 5;

      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];
        const isHeader = rowIndex === 0;
        const lineHeight = fontSize * 1.5;
        let xPosition = margin;
        let maxRowHeight = lineHeight;

        // Check if we need a new page
        if (yPosition < margin + lineHeight) {
          // Draw table borders for the previous page
          drawTableBorders(page, margin, tableStartY, totalTableWidth, tableStartY - (height - yPosition), rowIndex === data.length - 1);
          
          page = pdfDoc.addPage([842, 595]);
          yPosition = height - margin;
          tableStartY = yPosition;
        }

        // Calculate row height based on wrapped text
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const cellContent = String(row[colIndex] || '');
          const cellWidth = columnWidths[colIndex];
          const lines = wrapText(cellContent, font, fontSize, cellWidth - (cellPadding * 2));
          const cellHeight = lines.length * lineHeight + (cellPadding * 2);
          maxRowHeight = Math.max(maxRowHeight, cellHeight);
        }

        // Draw cells
        xPosition = margin;
        const rowStartY = yPosition;
        
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const cellContent = String(row[colIndex] || '');
          const cellWidth = columnWidths[colIndex];
          const lines = wrapText(cellContent, font, fontSize, cellWidth - (cellPadding * 2));
          
          // Draw cell background for header
          if (isHeader) {
            page.drawRectangle({
              x: xPosition,
              y: yPosition - maxRowHeight,
              width: cellWidth,
              height: maxRowHeight,
              color: rgb(0.95, 0.95, 0.95),
            });
          }

          // Draw cell borders
          page.drawLine({
            start: { x: xPosition, y: yPosition },
            end: { x: xPosition + cellWidth, y: yPosition },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
          });
          page.drawLine({
            start: { x: xPosition, y: yPosition - maxRowHeight },
            end: { x: xPosition + cellWidth, y: yPosition - maxRowHeight },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
          });
          page.drawLine({
            start: { x: xPosition, y: yPosition },
            end: { x: xPosition, y: yPosition - maxRowHeight },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
          });
          page.drawLine({
            start: { x: xPosition + cellWidth, y: yPosition },
            end: { x: xPosition + cellWidth, y: yPosition - maxRowHeight },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
          });

          // Draw cell content
          let cellY = yPosition - fontSize - cellPadding;
          lines.forEach(line => {
            page.drawText(line, {
              x: xPosition + cellPadding,
              y: cellY,
              size: fontSize,
              font: isHeader ? boldFont : font,
              color: rgb(0, 0, 0),
            });
            cellY -= lineHeight;
          });
          
          xPosition += cellWidth;
        }

        yPosition -= maxRowHeight;

        // Add extra space after header
        if (isHeader) {
          yPosition -= 2;
        }
      }

      // Draw final table borders
      drawTableBorders(page, margin, tableStartY, totalTableWidth, tableStartY - (height - yPosition), true);

      yPosition -= fontSize * 3; // Add space between sheets
    }

    // Save and download PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.xlsx', '')}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error converting XLSX to PDF:', error);
    throw error;
  }
};

// Helper function to wrap text
function wrapText(text, font, fontSize, maxWidth) {
  const words = String(text).split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
    
    if (width < maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Helper function to draw table borders
function drawTableBorders(page, x, y, width, height, isLastSection) {
  // Draw outer borders
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });
}