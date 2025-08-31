import { useEffect } from 'react';
import { initializeData } from '@/utils/initializeData';

export const useInitializeData = () => {
  useEffect(() => {
    initializeData();
  }, []);
};
