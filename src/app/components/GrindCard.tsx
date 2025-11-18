import { Card, CardContent, Typography, Box } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { Grind } from '@/types/grind.types';
import { useRouter } from 'next/navigation';

export default function GrindCard({ grind }: { grind: Grind }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/grind/${grind.id}`);
  };

  return (
    <Card 
        key={grind.id}
        onClick={handleClick}
        sx={{ 
        mb: 3,
        cursor: 'pointer',
        '&:hover': { 
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
        },
        transition: 'all 0.2s ease',
        border: '1px solid',
        borderColor: 'grey.200'
        }}
    >
        <CardContent sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontSize: '1.3rem',
                        fontWeight: 400,
                        color: 'text.primary',
                        mb: 0.5
                    }}
                >
                    {grind.title}
                </Typography>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: 'text.secondary',
                        opacity: 0.8,
                        fontSize: '0.8rem'
                    }}
                >
                    {grind.description}
                </Typography>
            </Box>
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'grey.700',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    pl: '10px',
                }}
            >
                <ChevronRight size={35} />
            </Box>
        </Box>
        </CardContent>
    </Card>
  );
}   