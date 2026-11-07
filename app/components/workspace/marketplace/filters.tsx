"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { opportunities as fallbackOpportunities, type Opportunity } from "./data";
import { Choice, DialogButton, FeedbackDialog, Note } from "./feedback-dialog";
import { useMarketplaceOpportunities } from "@/hooks/use-marketplace";
import type {
  InvestmentTypeCode,
  OpportunityOrdering,
  RiskCode,
} from "@/lib/api/marketplace";

function sectorCodeFromDisplay(display: string) {
  return display
    .trim()
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const defaultSectorOptions = [
  "Technology",
  "Healthcare",
  "Real Estate",
  "FinTech",
  "Agriculture",
  "Energy",
  "Consumer",
  "Industrial",
] as const;

const riskOptions: { code: RiskCode; label: string }[] = [
  { code: "LOW", label: "Low" },
  { code: "MEDIUM", label: "Medium" },
  { code: "HIGH", label: "High" },
];

const structureOptions: { code: InvestmentTypeCode; label: string }[] = [
  { code: "FIXED", label: "Fixed" },
  { code: "VARIABLE", label: "Variable" },
];

const sortOptions = [
  { id: "featured", label: "Featured", ordering: "featured" as OpportunityOrdering },
  { id: "closing", label: "Closing soon", ordering: "closing" as OpportunityOrdering },
  {
    id: "minimum",
    label: "Minimum investment: low to high",
    ordering: "min_investment" as OpportunityOrdering,
  },
  { id: "name", label: "Business name: A–Z", ordering: "title" as OpportunityOrdering },
] as const;

export type SortId = (typeof sortOptions)[number]["id"];

type Filters = {
  query: string;
  sectors: string[];
  risks: RiskCode[];
  structures: InvestmentTypeCode[];
  maxMinimum: number | null;
  sort: SortId;
};

type DialogName = "filters" | "structure" | "sort" | "empty" | null;

const emptyFilters: Filters = {
  query: "",
  sectors: [],
  risks: [],
  structures: [],
  maxMinimum: null,
  sort: "featured",
};

type FiltersValue = {
  filters: Filters;
  setQuery: (query: string) => void;
  filtering: boolean;
  results: Opportunity[];
  all: Opportunity[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  chips: { label: string; clear: () => void }[];
  reset: () => void;
  openFilters: () => void;
  openStructure: () => void;
  openSort: () => void;
  reportEmptySearch: () => void;
};

const FiltersContext = createContext<FiltersValue | null>(null);

function riskLabel(code: RiskCode) {
  return riskOptions.find((option) => option.code === code)?.label || code;
}

function structureLabel(code: InvestmentTypeCode) {
  return structureOptions.find((option) => option.code === code)?.label || code;
}

function sortOrdering(sort: SortId): OpportunityOrdering {
  return (
    sortOptions.find((option) => option.id === sort)?.ordering || "featured"
  );
}

export function FiltersProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const sectorCodeByLabel = useRef<Map<string, string>>(new Map());

  const sectorCodes = filters.sectors.map(
    (label) =>
      sectorCodeByLabel.current.get(label) || sectorCodeFromDisplay(label),
  );

  const opportunitiesQuery = useMarketplaceOpportunities({
    search: filters.query.trim() || undefined,
    sector: sectorCodes.length > 0 ? sectorCodes : undefined,
    risk_level: filters.risks.length > 0 ? filters.risks : undefined,
    investment_type:
      filters.structures.length > 0 ? filters.structures : undefined,
    max_min_investment: filters.maxMinimum ?? undefined,
    ordering: sortOrdering(filters.sort),
  });
  const [dialog, setDialog] = useState<DialogName>(null);
  const [draftSectors, setDraftSectors] = useState<string[]>([]);
  const [draftRisks, setDraftRisks] = useState<RiskCode[]>([]);
  const [draftStructures, setDraftStructures] = useState<InvestmentTypeCode[]>(
    [],
  );
  const [draftMax, setDraftMax] = useState("");
  const [draftSort, setDraftSort] = useState<SortId>("featured");

  const catalog = useMemo(() => {
    const rows =
      opportunitiesQuery.data && opportunitiesQuery.data.length > 0
        ? opportunitiesQuery.data
        : opportunitiesQuery.isError
          ? fallbackOpportunities
          : opportunitiesQuery.data || [];

    for (const item of rows) {
      if (item.sector && item.sectorCode) {
        sectorCodeByLabel.current.set(item.sector, item.sectorCode);
      }
    }
    return rows;
  }, [opportunitiesQuery.data, opportunitiesQuery.isError]);

  const sectorOptions = useMemo(() => {
    const fromData = Array.from(
      new Set(catalog.map((item) => item.sector).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
    return fromData.length > 0 ? fromData : [...defaultSectorOptions];
  }, [catalog]);

  // Server already filters/sorts when live; client matches only for error fallback.
  const results = useMemo(() => {
    if (!opportunitiesQuery.isError) return catalog;
    return sortOpportunities(
      catalog.filter((item) => matches(item, filters)),
      filters.sort,
    );
  }, [catalog, filters, opportunitiesQuery.isError]);

  const filtering =
    filters.query.trim().length > 0 ||
    filters.sectors.length > 0 ||
    filters.risks.length > 0 ||
    filters.structures.length > 0 ||
    filters.maxMinimum !== null ||
    filters.sort !== "featured";

  const chips = [
    ...filters.sectors.map((label) => ({
      label,
      clear: () =>
        setFilters((current) => ({
          ...current,
          sectors: current.sectors.filter((item) => item !== label),
        })),
    })),
    ...filters.risks.map((code) => ({
      label: riskLabel(code),
      clear: () =>
        setFilters((current) => ({
          ...current,
          risks: current.risks.filter((item) => item !== code),
        })),
    })),
    ...filters.structures.map((code) => ({
      label: structureLabel(code),
      clear: () =>
        setFilters((current) => ({
          ...current,
          structures: current.structures.filter((item) => item !== code),
        })),
    })),
    ...(filters.maxMinimum !== null
      ? [
          {
            label: `Minimum investment up to ${formatMoney(filters.maxMinimum)}`,
            clear: () =>
              setFilters((current) => ({ ...current, maxMinimum: null })),
          },
        ]
      : []),
  ];

  function reset() {
    setFilters(emptyFilters);
    setDialog(null);
  }

  function goToResults() {
    const path = window.location.pathname;
    if (
      path === "/marketplace" ||
      path === "/marketplace/watchlist" ||
      path === "/marketplace/secondary"
    ) {
      return;
    }
    router.push("/marketplace");
  }

  function close() {
    setDialog(null);
  }

  const featuredOrAll = filtering
    ? results
    : results.filter((item) => item.featured).length > 0
      ? results.filter((item) => item.featured)
      : results;

  const value: FiltersValue = {
    filters,
    setQuery: (query) => setFilters((current) => ({ ...current, query })),
    filtering,
    results: featuredOrAll,
    all: catalog,
    totalCount: catalog.length,
    isLoading: opportunitiesQuery.isLoading,
    isError: opportunitiesQuery.isError,
    errorMessage:
      opportunitiesQuery.error instanceof Error
        ? opportunitiesQuery.error.message
        : opportunitiesQuery.isError
          ? "Could not load marketplace opportunities."
          : null,
    chips,
    reset,
    openFilters: () => {
      setDraftSectors(filters.sectors);
      setDraftRisks(filters.risks);
      setDialog("filters");
    },
    openStructure: () => {
      setDraftStructures(filters.structures);
      setDraftMax(
        filters.maxMinimum === null ? "" : formatMoney(filters.maxMinimum),
      );
      setDialog("structure");
    },
    openSort: () => {
      setDraftSort(filters.sort);
      setDialog("sort");
    },
    reportEmptySearch: () => setDialog("empty"),
  };

  return (
    <FiltersContext.Provider value={value}>
      {children}
      {dialog === "filters" ? (
        <FeedbackDialog
          eyebrow="MARKETPLACE / FILTERS OPEN"
          title="Filter opportunities"
          placement="center"
          onClose={close}
          actions={
            <>
              <DialogButton onClick={reset}>Reset filters</DialogButton>
              <DialogButton
                tone="primary"
                onClick={() => {
                  setFilters((current) => ({
                    ...current,
                    sectors: draftSectors,
                    risks: draftRisks,
                  }));
                  close();
                  goToResults();
                }}
              >
                Apply filters
              </DialogButton>
            </>
          }
        >
          <p className="text-base leading-[1.4] text-[#53645B]">
            Choose one or more filters. Results update after Apply filters.
          </p>
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-1 text-base leading-[1.7] text-[#14271F]">
              Sector
            </legend>
            {sectorOptions.map((option) => (
              <Choice
                key={option}
                label={option}
                checked={draftSectors.includes(option)}
                onChange={() =>
                  toggleDraft(option, draftSectors, setDraftSectors)
                }
              />
            ))}
          </fieldset>
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-1 text-base leading-[1.7] text-[#14271F]">
              Risk level
            </legend>
            {riskOptions.map((option) => (
              <Choice
                key={option.code}
                label={option.label}
                checked={draftRisks.includes(option.code)}
                onChange={() =>
                  toggleDraft(option.code, draftRisks, setDraftRisks)
                }
              />
            ))}
          </fieldset>
        </FeedbackDialog>
      ) : null}
      {dialog === "structure" ? (
        <FeedbackDialog
          eyebrow="MARKETPLACE / FILTERS OPEN"
          title="Structure & minimum"
          placement="center"
          onClose={close}
          actions={
            <>
              <DialogButton onClick={close}>Cancel</DialogButton>
              <DialogButton
                tone="primary"
                onClick={() => {
                  setFilters((current) => ({
                    ...current,
                    structures: draftStructures,
                    maxMinimum: parseMoney(draftMax),
                  }));
                  close();
                  goToResults();
                }}
              >
                Apply filters
              </DialogButton>
            </>
          }
        >
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-1 text-base leading-[1.7] text-[#14271F]">
              Investment structure
            </legend>
            {structureOptions.map((option) => (
              <Choice
                key={option.code}
                label={option.label}
                checked={draftStructures.includes(option.code)}
                onChange={() =>
                  toggleDraft(option.code, draftStructures, setDraftStructures)
                }
              />
            ))}
          </fieldset>
          <label className="flex flex-col gap-[7px]">
            <span className="text-sm font-semibold leading-[1.4] text-[#14271F]">
              Maximum minimum investment · ₦
            </span>
            <input
              value={draftMax}
              onChange={(event) => setDraftMax(event.target.value)}
              placeholder="₦5,000"
              className="rounded-lg border-2 border-accent px-4 py-3 text-base leading-[1.4] text-[#14271F] outline-none"
            />
            <span className="text-[13px] leading-[1.4] text-[#53645B]">
              Show opportunities you can enter with {draftMax.trim() || "this amount"}{" "}
              or less.
            </span>
          </label>
          <p className="text-base leading-[1.7] text-[#14271F]">
            Selected:{" "}
            {selectionSummary(
              draftStructures.map(structureLabel),
              parseMoney(draftMax),
            )}
          </p>
        </FeedbackDialog>
      ) : null}
      {dialog === "sort" ? (
        <FeedbackDialog
          eyebrow="MARKETPLACE / SORT OPEN"
          title="Sort opportunities"
          placement="center"
          onClose={close}
          actions={
            <>
              <DialogButton onClick={close}>Cancel</DialogButton>
              <DialogButton
                tone="primary"
                onClick={() => {
                  setFilters((current) => ({ ...current, sort: draftSort }));
                  close();
                  goToResults();
                }}
              >
                Apply sort
              </DialogButton>
            </>
          }
        >
          <div className="flex flex-col gap-2.5">
            {sortOptions.map((option) => (
              <Choice
                key={option.id}
                label={option.label}
                checked={draftSort === option.id}
                onChange={() => setDraftSort(option.id)}
              />
            ))}
          </div>
          <Note>
            Projected returns use different structures and assumptions. They are
            not directly comparable and are not guaranteed.
          </Note>
        </FeedbackDialog>
      ) : null}
      {dialog === "empty" ? (
        <FeedbackDialog
          eyebrow="MARKETPLACE / EMPTY SEARCH"
          title="No opportunities found"
          placement="center"
          onClose={close}
          actions={
            <>
              <DialogButton onClick={close}>Close</DialogButton>
              <DialogButton tone="primary" onClick={reset}>
                Clear search & filters
              </DialogButton>
            </>
          }
        >
          <label className="flex flex-col gap-[7px]">
            <span className="text-sm font-semibold leading-[1.4] text-[#14271F]">
              Search business or industry
            </span>
            <input
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              className="rounded-lg border-2 border-accent px-4 py-3 text-base leading-[1.4] text-[#14271F] outline-none"
            />
          </label>
          <p className="text-base leading-[1.7] text-[#14271F]">
            0 matching results
          </p>
          <Note>
            No businesses match this search with your current filters. Try
            another search or clear the filters. Your saved opportunities are
            unchanged.
          </Note>
        </FeedbackDialog>
      ) : null}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const value = useContext(FiltersContext);
  if (!value) throw new Error("useFilters must be used inside FiltersProvider");
  return value;
}

export function DiscoveryBar({
  view = "primary",
}: {
  view?: "primary" | "secondary" | "watchlist";
}) {
  const {
    filters,
    setQuery,
    filtering,
    results,
    reset,
    openFilters,
    openStructure,
    openSort,
    reportEmptySearch,
  } = useFilters();

  const sectorLabel =
    filters.sectors.length === 0
      ? "All sectors"
      : filters.sectors.length === 1
        ? filters.sectors[0]
        : `${filters.sectors.length} sectors`;
  const riskLabelText =
    filters.risks.length === 0
      ? "Risk level"
      : filters.risks.length === 1
        ? riskLabel(filters.risks[0])
        : `${filters.risks.length} risk levels`;
  const structureLabelText =
    filters.structures.length === 0
      ? "Structure"
      : filters.structures.length === 1
        ? structureLabel(filters.structures[0])
        : `${filters.structures.length} structures`;
  const minimumLabel =
    filters.maxMinimum === null
      ? "Minimum amount"
      : `Min. ≤ ${formatMoney(filters.maxMinimum)}`;
  const sortLabel = `Sort: ${sortOptions.find((option) => option.id === filters.sort)?.label ?? "Featured"}`;

  return (
    <form
      className="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (view === "primary" && filters.query.trim() && results.length === 0) {
          reportEmptySearch();
        }
      }}
    >
      <label className="flex w-full items-center gap-3 rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 lg:h-11 lg:w-[260px] lg:gap-2 lg:px-3 lg:py-0">
        <span className="sr-only">Search business or industry</span>
        <input
          value={filters.query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search business or industry"
          className="min-w-0 flex-1 bg-transparent text-xs text-[#14271F] outline-none placeholder:text-[#53645B] lg:text-sm"
        />
        <img src="/workspace/icon-search.svg" alt="" width={16} height={16} />
      </label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 lg:contents">
        <MenuButton label={sectorLabel} onClick={openFilters} />
        <MenuButton label={riskLabelText} onClick={openFilters} />
        <MenuButton label={structureLabelText} onClick={openStructure} />
        <MenuButton label={minimumLabel} onClick={openStructure} />
        <div className="hidden lg:contents">
          <MenuButton label={sortLabel} onClick={openSort} />
        </div>
      </div>
      <button
        type="button"
        onClick={reset}
        className={`text-left text-sm leading-[1.35] ${
          filtering ? "text-accent" : "text-[#718078]"
        } ${view === "watchlist" ? "max-lg:hidden" : ""}`}
      >
        Reset filters
      </button>
    </form>
  );
}

function MenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full min-w-0 items-center justify-center gap-3 rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-xs text-[#53645B] lg:h-11 lg:w-auto lg:justify-start lg:gap-4 lg:px-3 lg:py-0 lg:text-sm"
    >
      <span className="truncate">{label}</span>
      <img
        src="/workspace/icon-chevron.svg"
        alt=""
        width={16}
        height={16}
        className="shrink-0"
      />
    </button>
  );
}

function toggleDraft<T extends string>(
  option: T,
  current: T[],
  setCurrent: (next: T[]) => void,
) {
  setCurrent(
    current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option],
  );
}

function matches(item: Opportunity, filters: Filters) {
  const needle = filters.query.trim().toLowerCase();
  if (
    needle &&
    !`${item.name} ${item.sector} ${item.structure}`
      .toLowerCase()
      .includes(needle)
  ) {
    return false;
  }
  if (filters.sectors.length > 0 && !filters.sectors.includes(item.sector)) {
    return false;
  }
  if (filters.risks.length > 0 && !filters.risks.includes(item.riskCode)) {
    return false;
  }
  if (
    filters.structures.length > 0 &&
    (!item.structureCode || !filters.structures.includes(item.structureCode))
  ) {
    return false;
  }
  if (filters.maxMinimum !== null && item.minimumValue > filters.maxMinimum) {
    return false;
  }
  return true;
}

function sortOpportunities(items: Opportunity[], sort: SortId) {
  const next = [...items];
  if (sort === "closing") {
    next.sort((a, b) => daysLeft(a.status) - daysLeft(b.status));
  } else if (sort === "minimum") {
    next.sort((a, b) => a.minimumValue - b.minimumValue);
  } else if (sort === "name") {
    next.sort((a, b) => a.name.localeCompare(b.name));
  }
  return next;
}

function daysLeft(status: string) {
  const match = status.match(/(\d+)\s+days/);
  return match ? Number(match[1]) : 999;
}

function parseMoney(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

function formatMoney(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function selectionSummary(structures: string[], maxMinimum: number | null) {
  const parts = [
    structures.join(", "),
    maxMinimum === null ? "" : `≤ ${formatMoney(maxMinimum)}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "None";
}
