import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';
import { PasswordResponses } from 'pdfjs-dist';

// Use the CDN version of the worker that matches our package version
const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export const convertPDFtoDOCX = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textContent = [];
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(' ');
      textContent.push(text);
    }

    // Create DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: textContent.map(text => new Paragraph({ 
          text,
          spacing: {
            after: 200
          }
        }))
      }]
    });

    // Generate DOCX buffer
    const buffer = await Packer.toBuffer(doc);
    
    // Create blob and download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}.docx`;
    link.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error converting PDF to DOCX:', error);
    throw error;
  }
};

export const reducePDFSize = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Compress PDF
    const compressedPdf = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
    
    const blob = new Blob([compressedPdf], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_compressed.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error reducing PDF size:', error);
    throw error;
  }
};