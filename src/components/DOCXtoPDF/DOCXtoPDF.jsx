import { Typography } from '@mui/material';
import FileConverter from '../FileConverter/FileConverter';
import { convertDOCXtoPDF } from '../../services/docxServices';

const DOCXtoPDF = () => (
  <FileConverter
    title="Convert DOCX to PDF"
    accept={['application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
    maxSize={5 * 1024 ** 2}
    onConvert={convertDOCXtoPDF}
  >
    <Typography>
      Drag & drop DOCX files here or click to select
    </Typography>
  </FileConverter>
);

export default DOCXtoPDF;