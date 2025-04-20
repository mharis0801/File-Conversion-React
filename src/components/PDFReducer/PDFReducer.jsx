import { Typography } from '@mui/material';
import FileConverter from '../FileConverter/FileConverter';
import { reducePDFSize } from '../../services/pdfServices';

const PDFReducer = () => (
  <FileConverter
    title="Reduce PDF File Size"
    accept={['application/pdf']}
    maxSize={10 * 1024 ** 2}
    onConvert={reducePDFSize}
  >
    <Typography>
      Drag & drop PDF files here or click to select
    </Typography>
  </FileConverter>
);

export default PDFReducer;