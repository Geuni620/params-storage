// useSearchState.ts
import { useEffect, useState } from "react";

const STORAGE_KEY = "search-params";

export interface SearchState {
  keyword: string;
  category: string;
  dateRange: string;
  status: string;
  sortBy: string;
}

export const defaultState: SearchState = {
  keyword: "",
  category: "all",
  dateRange: "all",
  status: "all",
  sortBy: "latest",
};

export function useSearchState() {
  const [searchState, setSearchState] = useState<SearchState>(() => {
    const storedState = localStorage.getItem(STORAGE_KEY);
    return storedState ? JSON.parse(storedState) : defaultState;
  });

  const setSearch = (newState: Partial<SearchState> | SearchState) => {
    setSearchState((prev) => {
      // 완전한 상태 객체가 전달된 경우 그대로 사용
      const updatedState =
        Object.keys(newState).length === Object.keys(defaultState).length
          ? (newState as SearchState)
          : { ...prev, ...newState };

      // localStorage 업데이트 또는 제거
      if (JSON.stringify(updatedState) === JSON.stringify(defaultState)) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      }

      return updatedState;
    });
  };

  const commitSearch = () => {
    // 검색 상태가 기본값인 경우 history에 null 상태로 저장
    if (JSON.stringify(searchState) === JSON.stringify(defaultState)) {
      window.history.pushState(null, "");
    } else {
      window.history.pushState(searchState, "");
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        setSearchState(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        setSearchState(defaultState);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    // 현재 상태가 기본값이면 null로 설정
    if (JSON.stringify(searchState) === JSON.stringify(defaultState)) {
      window.history.replaceState(null, "");
    } else {
      window.history.replaceState(searchState, "");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return [searchState, setSearch, commitSearch] as const;
}
