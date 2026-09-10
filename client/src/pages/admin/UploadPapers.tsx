import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  LinearProgress,
  Paper,
  Chip,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CloudUpload, Description, CheckCircle, Close } from '@mui/icons-material';
import { useUploadPaper } from '@hooks/usePapers';
import { useDepartments, useSubjectsByDepartment } from '@hooks/useDepartments';
import type { ExamMonth } from '@utils/types';
import { EXAM_MONTHS, getExamYears } from '@utils/helpers';

const steps = ['Paper Details', 'Upload File'];

const UploadPapers = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const uploadMutation = useUploadPaper();
  const { data: departments } = useDepartments();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState('');
  const [examYear, setExamYear] = useState('');
  const [examMonth, setExamMonth] = useState<ExamMonth | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: subjects } = useSubjectsByDepartment(selectedDepartment);

  const examMonths = EXAM_MONTHS;
  const years = getExamYears();

  const validateStep0 = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!selectedDepartment) newErrors.department = 'Department is required';
    if (!selectedSubject) newErrors.subject = 'Subject is required';
    if (!semester) newErrors.semester = 'Semester is required';
    if (!examYear) newErrors.examYear = 'Exam year is required';
    if (!examMonth) newErrors.examMonth = 'Exam month is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && validateStep0()) {
      setActiveStep(1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, file: '' }));
    } else {
      setErrors((prev) => ({ ...prev, file: 'Only PDF files up to 10MB are allowed' }));
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, file: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrors({ file: 'Please select a file' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('subjectId', selectedSubject);
    formData.append('departmentId', selectedDepartment);
    formData.append('semester', semester);
    formData.append('examYear', examYear);
    formData.append('examMonth', examMonth);
    formData.append('file', selectedFile);

    try {
      await uploadMutation.mutateAsync(formData);
      navigate('/admin/papers');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Upload Question Paper
      </Typography>

      <Card sx={{ maxWidth: 700, mx: 'auto' }}>
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {uploadMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
              {(uploadMutation.error as Error)?.message || 'Upload failed. Please try again.'}
            </Alert>
          )}

          {uploadMutation.isPending && <LinearProgress sx={{ mb: 2 }} />}

          {activeStep === 0 && (
            <Box>
              <TextField
                fullWidth
                label="Paper Title"
                placeholder="e.g., Data Structures and Algorithms - End Semester Exam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                sx={{ mb: 2 }}
              />

              <TextField
                select
                fullWidth
                label="Department"
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedSubject('');
                }}
                error={!!errors.department}
                helperText={errors.department}
                sx={{ mb: 2 }}
              >
                {departments?.length ? (
                  departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    Loading departments...
                  </MenuItem>
                )}
              </TextField>

              <TextField
                select
                fullWidth
                label="Subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedDepartment}
                error={!!errors.subject}
                helperText={errors.subject || (!selectedDepartment ? 'Select a department first' : '')}
                sx={{ mb: 2 }}
              >
                {subjects?.length ? (
                  subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </MenuItem>
                  ))
                ) : selectedDepartment ? (
                  <MenuItem disabled value="">
                    Loading subjects...
                  </MenuItem>
                ) : (
                  <MenuItem disabled value="">
                    Select a department first
                  </MenuItem>
                )}
              </TextField>

              <TextField
                select
                fullWidth
                label="Semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                error={!!errors.semester}
                helperText={errors.semester}
                sx={{ mb: 2 }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    Semester {sem}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Exam Year"
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  error={!!errors.examYear}
                  helperText={errors.examYear}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Exam Month"
                  value={examMonth}
                  onChange={(e) => setExamMonth(e.target.value as ExamMonth)}
                  error={!!errors.examMonth}
                  helperText={errors.examMonth}
                >
                  {examMonths.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Paper
                variant="outlined"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: dragOver ? 'action.hover' : 'background.default',
                  border: '2px dashed',
                  borderColor: selectedFile ? 'success.main' : dragOver ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={handleFileSelect}
                />
                {selectedFile ? (
                  <Box>
                    <CheckCircle color="success" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Close />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <CloudUpload sx={{ fontSize: 56, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Drag & drop a PDF file here, or click to browse
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Maximum file size: 10MB
                    </Typography>
                    {dragOver && (
                      <Chip label="Drop to upload" color="primary" size="small" sx={{ mt: 1 }} />
                    )}
                  </Box>
                )}
              </Paper>

              {errors.file && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.file}
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={handleSubmit}
                  disabled={uploadMutation.isPending || !selectedFile}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Paper'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UploadPapers;
