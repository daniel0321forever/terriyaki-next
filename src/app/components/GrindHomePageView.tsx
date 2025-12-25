'use client';

import { useState } from 'react';
import { useGrindStore } from '@/lib/stores/grind.store';

import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import { Target, PlusCircle, Mail, Award, Briefcase } from 'lucide-react';
import CustomAppBar from '@/app/components/CustomAppBar';
import { Grind } from '@/types/grind.types';

import CurrentGrindsView from './CurrentGrindsView';
import CreateNewGrindView from './CreateNewGrindView';
import InvitationsView from './InvitationsView';
import MyRecordsView from './MyRecordsView';
import MockingInterviewTestView from './MockingInterviewTestView';

type MenuItemType = 'current-grinds' | 'create-new' | 'invitations' | 'my-records' | 'mocking-interview';

interface MenuItem {
  id: MenuItemType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const menuItems: MenuItem[] = [
  { id: 'current-grinds', label: 'Current Grinds', icon: Target },
  { id: 'create-new', label: 'Create New Grind', icon: PlusCircle },
  { id: 'invitations', label: 'Invitations', icon: Mail },
  { id: 'my-records', label: 'My Records', icon: Award },
  { id: 'mocking-interview', label: 'Mocking Interview Test', icon: Briefcase },
];

const menuItemTitles: Record<MenuItemType, string> = {
  'current-grinds': 'Current Grinds',
  'create-new': 'Create New Grind',
  'invitations': 'Invitations',
  'my-records': 'My Records',
  'mocking-interview': 'Mocking Interview Test',
};

export default function GrindHomePageView() {
  const grind: Grind | null = useGrindStore((state) => state.currentGrind);
  const [activeMenu, setActiveMenu] = useState<MenuItemType>('current-grinds');

  const handleCreate = () => {
    setActiveMenu('create-new');
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'current-grinds':
        return <CurrentGrindsView handleCreate={handleCreate}/>;
      case 'create-new':
        return <CreateNewGrindView />;
      case 'invitations':
        return <InvitationsView />;
      case 'my-records':
        return <MyRecordsView />;
      case 'mocking-interview':
        return <MockingInterviewTestView />;
      default:
        return <CurrentGrindsView handleCreate={handleCreate}/>;
    }
  };

  const currentTitle = menuItemTitles[activeMenu];

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
      }}
    >
      <CustomAppBar />
      
      {/* Main Content Area with Sidebar */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          pt: '60px', // Account for AppBar
        }}
      >
        {/* Left Sidebar Menu */}
        <Box
          sx={{
            width: { xs: '200px', sm: '240px', md: '280px' },
            borderRight: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <List sx={{ pt: 2, px: 1 }}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeMenu === item.id;
              
              return (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => setActiveMenu(item.id)}
                    sx={{
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: isActive ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                      },
                      py: 1.5,
                      px: 2,
                    }}
                  >
                    <Box 
                      sx={{ 
                        mr: 1.5, 
                        display: 'flex', 
                        alignItems: 'center',
                        color: isActive ? '#000000' : 'rgba(0, 0, 0, 0.6)',
                        '& svg': {
                          color: 'inherit',
                        },
                      }}
                    >
                      <IconComponent size={20} />
                    </Box>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#000000' : 'rgba(0, 0, 0, 0.7)',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Right Content Area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4, lg: 6 },
            position: 'relative',
          }}
        >
          {/* Title with Threading Design */}
          <Box
            sx={{
              position: 'relative',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Horizontal line - left */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              style={{ 
                flex: 1, 
                maxWidth: '100px',
                height: '2px', 
                backgroundColor: '#000000', 
                transformOrigin: 'left' 
              }}
            />

            {/* Left circle dot */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Box
                sx={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  flexShrink: 0,
                }}
              />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
              style={{ flexShrink: 0 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.8rem', sm: '2.3rem', md: '2.8rem', lg: '3.2rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'rgb(0, 0, 0)',
                  lineHeight: 1.1,
                  mx: 2,
                }}
              >
                {currentTitle}
              </Typography>
            </motion.div>

            {/* Right circle dot */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Box
                sx={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  flexShrink: 0,
                }}
              />
            </motion.div>

            {/* Horizontal line - right */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              style={{ 
                flex: 1, 
                height: '2px', 
                backgroundColor: '#000000', 
                transformOrigin: 'right' 
              }}
            />
          </Box>

          {/* Content */}
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}