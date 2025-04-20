import { useState } from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import { Dropzone } from '@mantine/dropzone';
import { CloudUpload } from '@mui/icons-material';
import { analyzeDocument, extractTextFromFile } from '../../services/ai/aiService';
import styles from './AIChat.module.css';

const AIChat = () => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileDrop = async (files) => {
    try {
      const file = files[0];
      const content = await extractTextFromFile(file);
      setFile(file);
      setFileContent(content);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!fileContent || !query) return;

    setLoading(true);
    try {
      const response = await analyzeDocument(fileContent, query);
      setMessages(prev => [...prev, 
        { type: 'user', content: query },
        { type: 'ai', content: response.answer, confidence: response.confidence }
      ]);
      setQuery('');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h6" className={styles.title}>AI Assistant</Typography>
      
      <Dropzone
        onDrop={handleFileDrop}
        accept={['text/*', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}
        maxSize={5 * 1024 ** 2}
        className={styles.dropzone}
      >
        <Box className={styles.dropzoneContent}>
          <CloudUpload className={styles.uploadIcon} />
          <Typography>
            {file ? `Analyzing: ${file.name}` : 'Drag & drop a text file, PDF, or Excel file to analyze'}
          </Typography>
          <Typography color="textSecondary" className={styles.orText}>
            or
          </Typography>
          <Button
            variant="contained"
            component="label"
            className={styles.selectButton}
          >
            Select File
            <input
              type="file"
              hidden
              accept=".txt,.pdf,.xlsx,application/pdf,text/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileDrop([e.target.files[0]]);
                }
              }}
            />
          </Button>
        </Box>
      </Dropzone>

      <Paper className={styles.chatContainer}>
        {messages.map((msg, i) => (
          <Box 
            key={i} 
            className={`${styles.messageBox} ${msg.type === 'user' ? styles.userMessage : styles.aiMessage}`}
          >
            <Paper className={styles.message}>
              <Typography>{msg.content}</Typography>
              {msg.confidence && (
                <Typography variant="caption" color="text.secondary">
                  Confidence: {(msg.confidence * 100).toFixed(1)}%
                </Typography>
              )}
            </Paper>
          </Box>
        ))}
      </Paper>

      {error && (
        <Alert severity="error" className={styles.error}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmitQuery} className={styles.queryForm}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about the document..."
          disabled={loading || !file}
          className={styles.queryInput}
        />
        <button
          type="submit"
          disabled={loading || !file || !query}
          className={`${styles.submitButton} ${(loading || !file || !query) ? styles.disabled : ''}`}
        >
          {loading ? 'Processing...' : 'Ask'}
        </button>
      </form>
    </Box>
  );
};

export default AIChat;