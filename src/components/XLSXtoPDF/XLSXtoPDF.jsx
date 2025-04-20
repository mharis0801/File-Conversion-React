import { Typography } from '@mui/material';
import FileConverter from '../FileConverter/FileConverter';
import { convertXLSXtoPDF } from '../../services/xlsxServices';

const XLSXtoPDF = () => (
  <FileConverter
    title="Convert XLSX to PDF"
    accept={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}
    maxSize={5 * 1024 ** 2}
    onConvert={convertXLSXtoPDF}
  >
    <Typography>
      Drag & drop XLSX files here or click to select
    </Typography>
  </FileConverter>
);

export default XLSXtoPDF;