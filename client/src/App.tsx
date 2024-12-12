// App.tsx
import { useState, useEffect } from "react";
import { useSearchState } from "./useSearchState";

const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "name", label: "이름순" },
];

const categoryOptions = [
  { value: "all", label: "전체" },
  { value: "electronics", label: "전자기기" },
  { value: "clothing", label: "의류" },
  { value: "books", label: "도서" },
];

const dateRangeOptions = [
  { value: "all", label: "전체 기간" },
  { value: "today", label: "오늘" },
  { value: "week", label: "이번 주" },
  { value: "month", label: "이번 달" },
  { value: "year", label: "올해" },
];

const statusOptions = [
  { value: "all", label: "전체 상태" },
  { value: "active", label: "활성" },
  { value: "inactive", label: "비활성" },
  { value: "pending", label: "대기중" },
];

const STORAGE_KEY = "search-params";

// 디버깅을 위한 History 이벤트 패치
const originalPushState = window.history.pushState;
const originalReplaceState = window.history.replaceState;

window.history.pushState = function () {
  const result = originalPushState.apply(this, arguments);
  window.dispatchEvent(new Event("pushstate"));
  return result;
};

window.history.replaceState = function () {
  const result = originalReplaceState.apply(this, arguments);
  window.dispatchEvent(new Event("replacestate"));
  return result;
};

function HistoryDebugger() {
  const [historyLength, setHistoryLength] = useState(window.history.length);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleNavigation = () => {
      setHistoryLength(window.history.length);
      setCurrentIndex(performance.navigation?.navigationType || 0);
    };

    window.addEventListener("popstate", handleNavigation);
    window.addEventListener("pushstate", handleNavigation);
    window.addEventListener("replacestate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
      window.removeEventListener("pushstate", handleNavigation);
      window.removeEventListener("replacestate", handleNavigation);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h3 className="font-bold mb-2">History Stack Debug</h3>
      <div className="space-y-1 text-sm">
        <p>Stack Size: {historyLength}</p>
        <p>Current Position: {currentIndex}</p>
        <p>Current State: {JSON.stringify(window.history.state, null, 2)}</p>
      </div>
    </div>
  );
}

function App() {
  const [searchFilters, setSearchFilters, commitSearch] = useSearchState();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (filterName: string, value: string) => {
    setSearchFilters({
      [filterName]: value,
    });
  };

  // handleSearch 함수도 약간 수정 필요
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 실제 검색 버튼 클릭인 경우에만 history에 추가
      if (!(e instanceof Event)) {
        commitSearch();
      }

      console.log("History Stack:", {
        length: window.history.length,
        state: window.history.state,
      });

      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchFilters),
      });

      if (!response.ok) {
        throw new Error("검색 요청이 실패했습니다");
      }

      const data = await response.json();
      setSearchResults(data.data.items);
    } catch (error) {
      console.error("Search error:", error);
      setError(
        error instanceof Error ? error.message : "검색 중 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    const resetState = {
      keyword: "",
      category: "all",
      dateRange: "all",
      status: "all",
      sortBy: "latest",
    };

    // 상태 초기화
    setSearchFilters(resetState);
    setSearchResults([]);

    // localStorage 초기화
    localStorage.removeItem(STORAGE_KEY);

    // history 초기화: 현재 페이지만 남기고 모두 제거
    const currentPath = window.location.pathname;
    window.history.pushState(null, "", currentPath);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR", {
      style: "currency",
      currency: "KRW",
    });
  };

  // 컴포넌트 마운트 시 localStorage 확인 후 조건부 검색
  useEffect(() => {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState) {
      // localStorage에 저장된 검색 상태가 있는 경우에만 검색 실행
      handleSearch(new Event("submit") as any);
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">상세 검색</h1>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchFilters.keyword}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            검색
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            초기화
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={searchFilters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={searchFilters.dateRange}
            onChange={(e) => handleFilterChange("dateRange", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={searchFilters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={searchFilters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="mt-8">
        {isLoading && <div className="text-center py-4">검색 중...</div>}

        {error && <div className="text-red-500 text-center py-4">{error}</div>}

        {!isLoading && !error && searchResults.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              검색 결과 ({searchResults.length}건)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((item: any) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">카테고리:</span>{" "}
                      {categoryOptions.find(
                        (opt) => opt.value === item.category
                      )?.label || item.category}
                    </p>
                    <p>
                      <span className="font-medium">상태:</span>{" "}
                      {statusOptions.find((opt) => opt.value === item.status)
                        ?.label || item.status}
                    </p>
                    <p>
                      <span className="font-medium">가격:</span>{" "}
                      {formatPrice(item.price)}
                    </p>
                    <p>
                      <span className="font-medium">등록일:</span>{" "}
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!isLoading && !error && searchResults.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
      <HistoryDebugger />
    </div>
  );
}

export default App;
