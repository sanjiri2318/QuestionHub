import { Box, Card, CardContent, Typography, Avatar, Skeleton } from '@mui/material';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard = ({ label, value, icon, color, loading = false }: StatCardProps) => (
  <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: color, width: 56, height: 56, boxShadow: `0 4px 14px ${color}40` }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {loading ? <Skeleton width={50} /> : value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
