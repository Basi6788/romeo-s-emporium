import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CompareItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  description?: string;
}

interface CompareContextType {
  compareItems: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  isCompareOpen: boolean;
  setCompareOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [isCompareOpen, setCompareOpen] = useState(false);

  const addToCompare = useCallback((item: CompareItem) => {
    setCompareItems(prev => {
      if (prev.length >= 4) {
        return prev;
      }
      if (prev.find(i => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const isInCompare = useCallback((id: string) => {
    return compareItems.some(item => item.id === id);
  }, [compareItems]);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
      isCompareOpen,
      setCompareOpen
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};