import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  InputAdornment,
  Skeleton,
  Divider,
} from '@mui/material';
import { Search, Description, School, Business, Close } from '@mui/icons-material';
import { searchService } from '@services/search.service';
import type { QuestionPaper, Subject, Department } from '@utils/types';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const GlobalSearch = ({ open, onClose }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    papers: QuestionPaper[];
    subjects: (Subject & { department?: { id: string; name: string }; _count?: { papers: number } })[];
    departments: (Department & { _count?: { subjects: number; papers: number } })[];
  }>({ papers: [], subjects: [], departments: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({ papers: [], subjects: [], departments: [] });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults({ papers: [], subjects: [], departments: [] });
      return;
    }
    setLoading(true);
    try {
      const data = await searchService.globalSearch(q);
      setResults(data);
    } catch {
      setResults({ papers: [], subjects: [], departments: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const totalResults = results.papers.length + results.subjects.length + results.departments.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            position: 'fixed',
            top: '10%',
            m: 0,
            borderRadius: 2,
          },
        },
      }}
    >
      <Box sx={{ p: 2, pb: 0 }}>
        <TextField
          fullWidth
          placeholder="Search papers, subjects, departments..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          inputRef={inputRef}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <Box
                    onClick={onClose}
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Close fontSize="small" />
                  </Box>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {loading ? 'Searching...' : totalResults > 0 ? `${totalResults} results` : 'Type at least 2 characters'}
          </Typography>
          <Chip label="ESC to close" size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={56} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : totalResults > 0 ? (
          <List disablePadding>
            {results.papers.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }} color="text.secondary">
                    PAPERS ({results.papers.length})
                  </Typography>
                </Box>
                {results.papers.map((paper) => (
                  <ListItem
                    key={paper.id}
                    onClick={() => handleNavigate('/papers')}
                    sx={{ cursor: 'pointer', py: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                        <Description fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }} noWrap>
                          {paper.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          <Chip label={paper.subject?.code} size="small" sx={{ height: 18, fontSize: 10 }} />
                          <Chip label={paper.department?.name} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </>
            )}

            {results.subjects.length > 0 && (
              <>
                <Divider />
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }} color="text.secondary">
                    SUBJECTS ({results.subjects.length})
                  </Typography>
                </Box>
                {results.subjects.map((subject) => (
                  <ListItem
                    key={subject.id}
                    onClick={() => handleNavigate('/papers')}
                    sx={{ cursor: 'pointer', py: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                        <School fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {subject.code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {subject.name}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Sem {subject.semester} | {subject.department?.name} | {subject._count?.papers || 0} papers
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </>
            )}

            {results.departments.length > 0 && (
              <>
                <Divider />
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }} color="text.secondary">
                    DEPARTMENTS ({results.departments.length})
                  </Typography>
                </Box>
                {results.departments.map((dept) => (
                  <ListItem
                    key={dept.id}
                    onClick={() => handleNavigate('/papers')}
                    sx={{ cursor: 'pointer', py: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main', width: 36, height: 36 }}>
                        <Business fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {dept.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {dept._count?.subjects || 0} subjects | {dept._count?.papers || 0} papers
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </>
            )}
          </List>
        ) : query.length >= 2 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">No results found</Typography>
            <Typography variant="body2" color="text.secondary">
              Try different keywords
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">Start typing to search</Typography>
            <Typography variant="caption" color="text.secondary">
              Search across papers, subjects, and departments
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
