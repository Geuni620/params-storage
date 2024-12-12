import { useState } from "react";

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

function App() {
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    category: "all",
    dateRange: "all",
    status: "all",
    sortBy: "latest",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (filterName, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
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
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchFilters({
      keyword: "",
      category: "all",
      dateRange: "all",
      status: "all",
      sortBy: "latest",
    });
    setSearchResults([]);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    return price.toLocaleString("ko-KR", {
      style: "currency",
      currency: "KRW",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">상세 검색</h1>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* 기존 검색 폼 내용 */}
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

      {/* 검색 결과 표시 */}
      <div className="mt-8">
        {isLoading && <div className="text-center py-4">검색 중...</div>}

        {error && <div className="text-red-500 text-center py-4">{error}</div>}

        {!isLoading && !error && searchResults.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              검색 결과 ({searchResults.length}건)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((item) => (
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
    </div>
  );
}

export default App;
