import { Grind, DayProgress } from '@/types/grind.types';

// Mock Data - Easily modifiable fake data for development
export const MOCK_GRINDS: Grind[] = [
  {
    id: 1,
    title: "LeetCode 30 Days",
    description: "30 days | NT 9000",
    startDate: "Aug 1",
    endDate: "Sep 1",
    duration: 30,
    taskToday: {
      id: 1, 
      type: 'LeetCode',
      title: "LeetCode 72",
      description: "Solve 3 LeetCode Problems",
    },
    punishment: { 
      dailyRate: 10,
      initialPrice: 300
    },
    autoRenew: false,
    weeklyTest: true,
    currentUser: {
      missedDays: 1,
      totalPenalty: 300,
      avatar: "/api/placeholder/48/48"
    },
    progress: Array.from({ length: 30 }, (_, i): DayProgress => ({
      day: i + 1,
      status: i < 5 ? 'completed' : i === 5 || i === 6 ? 'missed' : 'upcoming',
      date: `Aug ${i + 1}`
    })),
    participants: [
      {
        id: 1,
        name: "Alex Chen",
        avatar: "/api/placeholder/48/48",
        missedDays: 1,
        totalPenalty: 300
      },
      {
        id: 2,
        name: "Sarah Kim",
        avatar: "/api/placeholder/48/48",
        missedDays: 1,
        totalPenalty: 300
      }
    ]
  },
  {
    id: 2,
    title: "GRE Grind",
    description: "30 days | NT 9000",
    startDate: "Aug 1",
    endDate: "Sep 1",
    duration: 30,
    taskToday: {
      id: 2,
      type: 'GRE',
      title: "GRE Vocab * 10",
      description: "Learn 10 GRE Vocab",
    },
    punishment: {
      dailyRate: 10,
      initialPrice: 300
    },
    autoRenew: true,
    weeklyTest: true,
    currentUser: {
      missedDays: 2,
      totalPenalty: 20,
      avatar: "/api/placeholder/48/48"
    },
    progress: Array.from({ length: 30 }, (_, i): DayProgress => ({
      day: i + 1,
      status: i < 4 ? 'completed' : i === 4 || i === 5 ? 'missed' : i < 8 ? 'completed' : 'upcoming',
      date: `Aug ${i + 1}`
    })),
    participants: [
      {
        id: 3,
        name: "Mike Johnson",
        avatar: "/api/placeholder/48/48",
        missedDays: 1,
        totalPenalty: 300
      },
      {
        id: 4,
        name: "Emily Davis", 
        avatar: "/api/placeholder/48/48",
        missedDays: 1,
        totalPenalty: 300
      }
    ]
  }
];

// Helper function to get grind by ID
export const getGrindById = (id: number): Grind | undefined => {
  return MOCK_GRINDS.find(grind => grind.id === id);
}; 