import { useState } from 'react'
import { Box, Container, Tab, Tabs, Typography } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { MantineProvider } from '@mantine/core'
import PDFReducer from './components/PDFReducer/PDFReducer'
import XLSXtoPDF from './components/XLSXtoPDF/XLSXtoPDF'
import DOCXtoPDF from './components/DOCXtoPDF/DOCXtoPDF'
import AIChat from './components/AIChat/AIChat'
import styles from './App.module.css'

function App() {
  const [currentTab, setCurrentTab] = useState(0)
  
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
    },
  })

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  const TabPanel = ({ children, value, index }) => {
    return value === index && children
  }

  return (
    <MantineProvider>
      <ThemeProvider theme={theme}>
        <Container maxWidth="md">
          <Box className={styles.container}>
            <Typography variant="h4" component="h1" className={styles.title}>
              File Manipulation Tools
            </Typography>
            
            <Box className={styles.tabsContainer}>
              <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable">
                <Tab label="PDF Reducer" />
                <Tab label="XLSX to PDF" />
                <Tab label="DOCX to PDF" />
                <Tab label="AI Chat" />
              </Tabs>
            </Box>

            <TabPanel value={currentTab} index={0}>
              <PDFReducer />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
              <XLSXtoPDF />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
              <DOCXtoPDF />
            </TabPanel>
            <TabPanel value={currentTab} index={3}>
              <AIChat />
            </TabPanel>
          </Box>
        </Container>
      </ThemeProvider>
    </MantineProvider>
  )
}

export default App
