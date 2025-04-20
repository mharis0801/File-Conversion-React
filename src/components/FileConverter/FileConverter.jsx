import { useState, useRef } from 'react';
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material';
import { Dropzone } from '@mantine/dropzone';
import { CloudUpload } from '@mui/icons-material';
import styles from './FileConverter.module.css';

const FileConverter = ({ title, accept, maxSize, onConvert, children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrop = async (files) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onConvert(files[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!loading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h6" className={styles.title}>{title}</Typography>
      {error && (
        <Alert severity="error" className={styles.error}>
          {error}
        </Alert>
      )}
      <Dropzone
        onDrop={handleDrop}
        accept={accept}
        maxSize={maxSize}
        disabled={loading}
        className={styles.dropzone}
      >
        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress size={24} />
            <Typography>Processing file...</Typography>
          </Box>
        ) : (
          <Box className={styles.contentContainer}>
            <CloudUpload className={styles.uploadIcon} />
            {children}
            <Typography color="textSecondary" className={styles.orText}>
              or
            </Typography>
            <Button
              variant="contained"
              onClick={handleButtonClick}
              className={styles.selectButton}
            >
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept={accept.join(',')}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleDrop([e.target.files[0]]);
                }
              }}
            />
          </Box>
        )}
      </Dropzone>
    </Box>
  );
};

export default FileConverter;