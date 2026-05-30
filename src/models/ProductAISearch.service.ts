import { ProductCollection, ProductSort } from "../libs/enums/product.enums";
import { ProductAISearchFilters } from "../libs/types/product";

type TokenEntry<T> = { token: string; value: T };

type PriceRangeResult = {
  minPrice?: number;
  maxPrice?: number;
  remaining: string;
};

const CATEGORY_TOKENS: Array<TokenEntry<ProductCollection>> = [
  { token: "fashion", value: ProductCollection.FASHION },
  { token: "clothes", value: ProductCollection.FASHION },
  { token: "apparel", value: ProductCollection.FASHION },
  { token: "parfum", value: ProductCollection.PARFUM },
  { token: "perfume", value: ProductCollection.PARFUM },
  { token: "beauty", value: ProductCollection.BEAUTY },
  { token: "health", value: ProductCollection.HEALTH },
  { token: "vitamins", value: ProductCollection.VITAMINS },
  { token: "vitamin", value: ProductCollection.VITAMINS },
  { token: "electronics", value: ProductCollection.ELECTRONICS },
  { token: "electronic", value: ProductCollection.ELECTRONICS },
  { token: "gadget", value: ProductCollection.ELECTRONICS },
  { token: "gadgets", value: ProductCollection.ELECTRONICS },
  { token: "kids", value: ProductCollection.KIDS },
  { token: "kid", value: ProductCollection.KIDS },
  { token: "children", value: ProductCollection.KIDS },
  { token: "child", value: ProductCollection.KIDS },
  { token: "baby", value: ProductCollection.KIDS }
];

const COLOR_TOKENS: Array<TokenEntry<string>> = [
  { token: "black", value: "black" },
  { token: "white", value: "white" },
  { token: "red", value: "red" },
  { token: "blue", value: "blue" },
  { token: "green", value: "green" },
  { token: "yellow", value: "yellow" },
  { token: "pink", value: "pink" },
  { token: "purple", value: "purple" },
  { token: "orange", value: "orange" },
  { token: "brown", value: "brown" },
  { token: "gray", value: "gray" },
  { token: "grey", value: "gray" },
  { token: "beige", value: "beige" },
  { token: "silver", value: "silver" },
  { token: "gold", value: "gold" }
];

const SORT_PATTERNS: Array<{ pattern: RegExp; sort: ProductSort }> = [
  { pattern: /\b(cheap|cheapest|low price|price low|lowest price)\b/i, sort: ProductSort.PRICE_LOW },
  { pattern: /\b(expensive|high price|price high|highest price)\b/i, sort: ProductSort.PRICE_HIGH },
  { pattern: /\b(top rated|best rated|rating|popular)\b/i, sort: ProductSort.TOP_RATED },
  { pattern: /\b(newest|latest|new)\b/i, sort: ProductSort.NEWEST }
];

class ProductAISearchService {
  public parseFilters(query: string): ProductAISearchFilters {
    const normalized = (query || "").toString().trim().toLowerCase();
    if (!normalized) return {};

    let working = normalized;
    const filters: ProductAISearchFilters = {};

    const categoryMatch = this.extractToken(working, CATEGORY_TOKENS);
    if (categoryMatch) {
      filters.category = categoryMatch.value;
      working = categoryMatch.remaining;
    }

    const colorMatch = this.extractToken(working, COLOR_TOKENS);
    if (colorMatch) {
      filters.color = colorMatch.value;
      working = colorMatch.remaining;
    }

    for (const entry of SORT_PATTERNS) {
      if (entry.pattern.test(working)) {
        filters.sort = entry.sort;
        working = working.replace(entry.pattern, " ");
        break;
      }
    }

    const priceResult = this.extractPriceRange(working);
    if (priceResult) {
      filters.minPrice = priceResult.minPrice;
      filters.maxPrice = priceResult.maxPrice;
      working = priceResult.remaining;
    }

    const keyword = this.normalizeKeyword(working);
    if (keyword) filters.keyword = keyword;

    return filters;
  }

  private extractToken<T>(text: string, tokens: Array<TokenEntry<T>>): { value: T; remaining: string } | null {
    for (const entry of tokens) {
      if (this.containsWord(text, entry.token)) {
        return { value: entry.value, remaining: this.removeWord(text, entry.token) };
      }
    }
    return null;
  }

  private extractPriceRange(text: string): PriceRangeResult | null {
    let working = text;
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    const betweenPattern = /\b(?:between|from)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*\$?\s*(\d+(?:\.\d+)?)/i;
    const rangePattern = /\b(\d+(?:\.\d+)?)\s*(?:-|\sto\s)\s*\$?\s*(\d+(?:\.\d+)?)/i;
    const maxPattern = /\b(?:under|below|less than|up to|<=)\s*\$?\s*(\d+(?:\.\d+)?)/i;
    const minPattern = /\b(?:over|above|more than|at least|>=)\s*\$?\s*(\d+(?:\.\d+)?)/i;

    let match = working.match(betweenPattern) || working.match(rangePattern);
    if (match) {
      const first = this.toNumber(match[1]);
      const second = this.toNumber(match[2]);
      if (first != null && second != null) {
        minPrice = Math.min(first, second);
        maxPrice = Math.max(first, second);
        working = working.replace(match[0], " ");
        return { minPrice, maxPrice, remaining: working };
      }
    }

    match = working.match(maxPattern);
    if (match) {
      const value = this.toNumber(match[1]);
      if (value != null) {
        maxPrice = value;
        working = working.replace(match[0], " ");
      }
    }

    match = working.match(minPattern);
    if (match) {
      const value = this.toNumber(match[1]);
      if (value != null) {
        minPrice = value;
        working = working.replace(match[0], " ");
      }
    }

    if (minPrice == null && maxPrice == null) return null;

    if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
      const temp = minPrice;
      minPrice = maxPrice;
      maxPrice = temp;
    }

    return { minPrice, maxPrice, remaining: working };
  }

  private containsWord(text: string, token: string): boolean {
    const pattern = new RegExp(`\\b${this.escapeRegex(token)}\\b`, "i");
    return pattern.test(text);
  }

  private removeWord(text: string, token: string): string {
    const pattern = new RegExp(`\\b${this.escapeRegex(token)}\\b`, "ig");
    return text.replace(pattern, " ");
  }

  private normalizeKeyword(text: string): string {
    return text.replace(/\s+/g, " ").trim();
  }

  private toNumber(value: string): number | undefined {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

export default ProductAISearchService;
