import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { SavedListingItem } from "../types/savedListing.types";
import * as savedListingService from "../services/savedListing.service";
import { useAuth } from "./AuthContext";

interface SavedListingsContextValue {
  saved: SavedListingItem[];
  isLoading: boolean;
  isSaved: (listingId: string) => boolean;
  toggleSave: (listingId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const SavedListingsContext = createContext<SavedListingsContextValue | undefined>(undefined);

export function SavedListingsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [saved, setSaved] = useState<SavedListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setSaved([]);
      return;
    }
    try {
      setSaved(await savedListingService.fetchSavedListings());
    } catch {
      setSaved([]);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) return;
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, user?.id]);

  const isSaved = useCallback(
    (listingId: string) => saved.some((s) => s.listing_id === listingId),
    [saved]
  );

  const toggleSave = useCallback(
    async (listingId: string) => {
      if (isSaved(listingId)) {
        setSaved(await savedListingService.unsaveListing(listingId));
      } else {
        setSaved(await savedListingService.saveListing(listingId));
      }
    },
    [isSaved]
  );

  return (
    <SavedListingsContext.Provider value={{ saved, isLoading, isSaved, toggleSave, refresh }}>
      {children}
    </SavedListingsContext.Provider>
  );
}

export function useSavedListings(): SavedListingsContextValue {
  const context = useContext(SavedListingsContext);
  if (!context) {
    throw new Error("useSavedListings must be used within a SavedListingsProvider");
  }
  return context;
}