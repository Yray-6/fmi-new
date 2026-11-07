"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { DialogButton, FeedbackDialog, Note } from "./feedback-dialog";
import {
  useMarketplaceWatchlist,
  useWatchlistMutation,
} from "@/hooks/use-marketplace";

type Feedback =
  | { kind: "saved"; id: string; name: string }
  | { kind: "removed"; id: string; name: string }
  | { kind: "cleared"; id: string; name: string }
  | { kind: "failed"; id: string; name: string; removing: boolean }
  | null;

type WatchlistValue = {
  saved: string[];
  items: ReturnType<typeof useMarketplaceWatchlist>["data"];
  isLoading: boolean;
  toggle: (id: string, name: string) => void;
};

const WatchlistContext = createContext<WatchlistValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const watchlistQuery = useMarketplaceWatchlist();
  const mutation = useWatchlistMutation();
  const [feedback, setFeedback] = useState<Feedback>(null);

  const saved = (watchlistQuery.data || []).map((item) => item.id);

  async function toggle(id: string, name: string) {
    const removing = saved.includes(id);
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setFeedback({ kind: "failed", id, name, removing });
      return;
    }

    try {
      await mutation.mutateAsync({ id, removing, name });
      const nextCount = removing ? saved.length - 1 : saved.length + 1;
      if (!removing) setFeedback({ kind: "saved", id, name });
      else if (nextCount <= 0) setFeedback({ kind: "cleared", id, name });
      else setFeedback({ kind: "removed", id, name });
    } catch {
      setFeedback({ kind: "failed", id, name, removing });
    }
  }

  async function undoRemoval() {
    if (!feedback || (feedback.kind !== "removed" && feedback.kind !== "cleared")) {
      return;
    }
    try {
      await mutation.mutateAsync({
        id: feedback.id,
        removing: false,
        name: feedback.name,
      });
      setFeedback(null);
    } catch {
      setFeedback({
        kind: "failed",
        id: feedback.id,
        name: feedback.name,
        removing: false,
      });
    }
  }

  return (
    <WatchlistContext.Provider
      value={{
        saved,
        items: watchlistQuery.data,
        isLoading: watchlistQuery.isLoading,
        toggle,
      }}
    >
      {children}
      {feedback?.kind === "saved" ? (
        <FeedbackDialog
          eyebrow="WATCHLIST / SUCCESS"
          title="Saved to watchlist"
          onClose={() => setFeedback(null)}
          actions={
            <>
              <DialogButton onClick={() => setFeedback(null)}>Done</DialogButton>
              <DialogButton
                tone="primary"
                href="/marketplace/watchlist"
                onClick={() => setFeedback(null)}
              >
                View watchlist
              </DialogButton>
            </>
          }
        >
          <Note title="Opportunity saved">
            {feedback.name} is on your watchlist. Your investments and existing
            orders are unchanged.
          </Note>
          <p className="text-base leading-[1.7] text-[#14271F]">
            Watchlisting does not reserve an allocation or commit funds. Your
            holdings and pending orders are unchanged.
          </p>
        </FeedbackDialog>
      ) : null}
      {feedback?.kind === "removed" ? (
        <FeedbackDialog
          eyebrow="WATCHLIST / UPDATED"
          title="Removed from watchlist"
          onClose={() => setFeedback(null)}
          actions={
            <>
              <DialogButton onClick={undoRemoval}>Undo</DialogButton>
              <DialogButton tone="primary" onClick={() => setFeedback(null)}>
                Done
              </DialogButton>
            </>
          }
        >
          <Note title="Opportunity removed">{feedback.name} was removed.</Note>
        </FeedbackDialog>
      ) : null}
      {feedback?.kind === "cleared" ? (
        <FeedbackDialog
          eyebrow="WATCHLIST / EMPTY"
          title="Watchlist cleared"
          onClose={() => setFeedback(null)}
          actions={
            <>
              <DialogButton onClick={undoRemoval}>Undo</DialogButton>
              <DialogButton tone="primary" onClick={() => setFeedback(null)}>
                Done
              </DialogButton>
            </>
          }
        >
          <Note title="Last saved opportunity removed">
            {feedback.name} was removed. Your watchlist is empty.
          </Note>
        </FeedbackDialog>
      ) : null}
      {feedback?.kind === "failed" ? (
        <FeedbackDialog
          eyebrow="WATCHLIST / REQUEST FAILURE"
          title="Couldn’t update watchlist"
          onClose={() => setFeedback(null)}
          actions={
            <>
              <DialogButton onClick={() => setFeedback(null)}>
                Keep browsing
              </DialogButton>
              <DialogButton
                tone="primary"
                onClick={() => toggle(feedback.id, feedback.name)}
              >
                Retry
              </DialogButton>
            </>
          }
        >
          <Note tone="failure" title="Your change wasn’t saved">
            Your saved opportunities are unchanged. Check your connection and
            try again.
          </Note>
          <p className="text-base leading-[1.7] text-[#14271F]">
            No funds were moved and no order was created.
          </p>
        </FeedbackDialog>
      ) : null}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const value = useContext(WatchlistContext);
  if (!value) {
    throw new Error("useWatchlist must be used inside WatchlistProvider");
  }
  return value;
}
