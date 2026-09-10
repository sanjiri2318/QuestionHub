import { Box, Typography, Tooltip, useTheme } from '@mui/material';

interface MiniBarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  showLabels?: boolean;
}

const MiniBarChart = ({ data, height = 120, showLabels = true }: MiniBarChartProps) => {
  const theme = useTheme();
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barMaxHeight = height - 30;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height }}>
        {data.map((item, i) => (
          <Tooltip key={i} title={`${item.label}: ${item.value}`} arrow>
            <Box
              sx={{
                flex: 1,
                height: `${(item.value / maxValue) * barMaxHeight}px`,
                minHeight: item.value > 0 ? 4 : 1,
                bgcolor: theme.palette.primary.main,
                borderRadius: '2px 2px 0 0',
                opacity: 0.7,
                transition: 'height 0.3s, opacity 0.2s',
                '&:hover': { opacity: 1 },
              }}
            />
          </Tooltip>
        ))}
      </Box>
      {showLabels && (
        <Box sx={{ display: 'flex', mt: 0.5 }}>
          {data.map((item, i) => (
            <Typography
              key={i}
              variant="caption"
              color="text.secondary"
              sx={{ flex: 1, textAlign: 'center', fontSize: 9 }}
            >
              {item.label}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MiniBarChart;
