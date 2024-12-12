import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // 클라이언트의 주소
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Requested-With"],
    maxAge: 86400,
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 8000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

app.get("/health", (c) => {
  return c.json({ message: "OK" });
});

/**
app.get("/test", (c) => {
  const companySeq = c.req.queries("companySeq");

  if (!companySeq) {
    return c.json({
      message: "companySeq 파라미터가 없습니다.",
    });
  }

  console.log("받은 companySeq 개수:", companySeq.length);
  console.log("companySeq 값들:", companySeq);

  return c.json({
    count: companySeq.length,
    companySeqs: companySeq,
    message: "요청이 성공적으로 처리되었습니다.",
  });
});
 */

// 임의의 데이터 생성 함수
function generateMockData(filters: any) {
  const items = [];
  const totalItems = Math.floor(Math.random() * 50) + 10; // 10-60개 사이의 결과

  for (let i = 0; i < totalItems; i++) {
    items.push({
      id: i + 1,
      title: `상품 ${i + 1}${
        filters.keyword ? ` - ${filters.keyword} 관련` : ""
      }`,
      category:
        filters.category === "all"
          ? ["electronics", "clothing", "books"][Math.floor(Math.random() * 3)]
          : filters.category,
      status:
        filters.status === "all"
          ? ["active", "inactive", "pending"][Math.floor(Math.random() * 3)]
          : filters.status,
      price: Math.floor(Math.random() * 1000000) + 10000,
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 31536000000)
      ).toISOString(),
      description: `이것은 상품 ${i + 1}에 대한 설명입니다. ${
        filters.keyword ? filters.keyword : "일반"
      } 제품입니다.`,
    });
  }

  // 정렬 적용
  if (filters.sortBy === "latest") {
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (filters.sortBy === "oldest") {
    items.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else if (filters.sortBy === "name") {
    items.sort((a, b) => a.title.localeCompare(b.title));
  }

  return items;
}

app.post("/search", async (c) => {
  try {
    const filters = await c.req.json();
    const items = generateMockData(filters);

    return c.json({
      success: true,
      data: {
        items,
        total: items.length,
        filters,
      },
      message: "검색이 완료되었습니다.",
    });
  } catch (error) {
    console.error("Search error:", error);
    return c.json(
      {
        success: false,
        message: "검색 처리 중 오류가 발생했습니다.",
      },
      500
    );
  }
});
