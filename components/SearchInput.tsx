"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState, useTransition } from "react";

function SearchBar() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  // Initialize with current query or empty string
  const defaultQuery = searchParams.get("q")?.toString() || "";

  // Debounce helper
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((term: string) => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }

      startTransition(() => {
        // If we are not on the search page, we should go there when searching
        if (window.location.pathname !== '/search' && term) {
            replace(`/search?${params.toString()}`);
        } else if (window.location.pathname === '/search') {
            replace(`/search?${params.toString()}`);
        }
      });
    }, 500),
    [searchParams, replace]
  );

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className={`h-4 w-4 ${isPending ? "text-primary-500 animate-pulse" : "text-slate-400"}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search..."
        defaultValue={defaultQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-4 py-1.5 w-64 rounded-full text-sm text-slate-900 bg-slate-100 border border-transparent focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
      />
    </div>
  );
}

export default function SearchInput() {
  return (
    <Suspense fallback={
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
           <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="pl-10 pr-4 py-1.5 w-64 rounded-full bg-slate-100 h-8" />
      </div>
    }>
      <SearchBar />
    </Suspense>
  );
}
