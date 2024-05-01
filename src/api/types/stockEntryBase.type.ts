// Generated by https://quicktype.io

import { PriceHistory, SubType } from ".";

export interface StockEntryBase {
  id: number;
  bought: number;
  minimum_price?: number;
  list_price?: number;
  sub_type?: SubType;
  status: StockStatus;
  created_at: string;
  updated_at: string;
  price_history: PriceHistory[];
}

export enum StockStatus {
  Pending = "pending",
  Live = "live",
  ToLowProfit = "to_low_profit",
  NoSellers = "no_sellers",
  NoBuyers = "no_buyers",
  InActive = "inactive",
  SMALimit = "sma_limit",
  OrderLimit = "order_limit",
  Overpriced = "overpriced",
  Underpriced = "underpriced",
}
