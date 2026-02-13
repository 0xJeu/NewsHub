import { loadMoreByContext } from "@/components/ArticleGrid";
import {
  loadMoreArticles,
  loadMoreCategoryArticles,
  loadMoreSearchResults,
} from "@/app/actions";

jest.mock("@/app/actions", () => ({
  loadMoreArticles: jest.fn(),
  loadMoreCategoryArticles: jest.fn(),
  loadMoreSearchResults: jest.fn(),
}));

describe("ArticleGrid load-more context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadMoreArticles as jest.Mock).mockResolvedValue([]);
    (loadMoreCategoryArticles as jest.Mock).mockResolvedValue([]);
    (loadMoreSearchResults as jest.Mock).mockResolvedValue([]);
  });

  it("calls homepage loader with page and stable homepageQuery", async () => {
    await loadMoreByContext({ strategy: "homepage", homepageQuery: "ai regulation" }, 2);

    expect(loadMoreArticles).toHaveBeenCalledWith(2, "ai regulation");
    expect(loadMoreCategoryArticles).not.toHaveBeenCalled();
    expect(loadMoreSearchResults).not.toHaveBeenCalled();
  });

  it("calls category loader with category slug and page", async () => {
    await loadMoreByContext({ strategy: "category", categorySlug: "technology" }, 2);

    expect(loadMoreCategoryArticles).toHaveBeenCalledWith("technology", 2);
    expect(loadMoreArticles).not.toHaveBeenCalled();
    expect(loadMoreSearchResults).not.toHaveBeenCalled();
  });

  it("calls search loader with search query and page", async () => {
    await loadMoreByContext({ strategy: "search", searchQuery: "openai" }, 2);

    expect(loadMoreSearchResults).toHaveBeenCalledWith("openai", 2);
    expect(loadMoreArticles).not.toHaveBeenCalled();
    expect(loadMoreCategoryArticles).not.toHaveBeenCalled();
  });
});
