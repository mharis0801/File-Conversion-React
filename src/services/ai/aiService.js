import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeDocument = async (text, query) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `Given the following context, please answer this question: "${query}"\n\nContext:\n${text}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return {
      answer: response.text(),
      confidence: 1.0
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw new Error('Failed to analyze the document. Please try again.');
  }
};

export const extractTextFromFile = async (file) => {
  try {
    let extractedText = '';
    
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      // Enhanced PDF text extraction with structure preservation
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const text = await page.getText();
        extractedText += `Page ${i + 1}:\n${text}\n\n`;
      }
    } 
    else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      // Enhanced Excel extraction with better structure
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        extractedText += `Sheet: ${sheetName}\n`;
        extractedText += '='.repeat(40) + '\n';
        
        if (data.length > 0) {
          // Add headers with formatting
          const headers = data[0];
          extractedText += headers.join(' | ') + '\n';
          extractedText += '-'.repeat(headers.join(' | ').length) + '\n';
          
          // Add data rows
          for (let i = 1; i < data.length; i++) {
            const row = data[i];
            extractedText += row.map(cell => cell ?? '').join(' | ') + '\n';
          }
        }
        extractedText += '\n';
      }
    } 
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX files, we'll get the text content
      const text = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
      });
      extractedText = `Document Content:\n${text}`;
    }
    else {
      // For text files and other formats
      extractedText = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
      });
    }

    // Add file metadata to help with context
    const metadata = `File Information:
Name: ${file.name}
Type: ${file.type}
Size: ${(file.size / 1024).toFixed(2)} KB
Last Modified: ${new Date(file.lastModified).toLocaleString()}
-------------------\n\n`;

    return metadata + extractedText;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error('Failed to read the file. Please make sure it contains readable text.');
  }
};