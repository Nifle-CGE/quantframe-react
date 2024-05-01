export enum QfSocketEvent {
  // App
  OnInitialize = "App:OnInitialize",
  UpdateSettings = "App:UpdateSettings",

  // Warframe Market
  UpdateOrders = "WFM:UpdateOrders",
  UpdateTransaction = "WFM:UpdateTransaction",
  UpdateAuction = "WFM:UpdateAuction",

  // Chat
  UpdateChats = "WFM:UpdateChats",
  UpdateChatMessages = "WFM:UpdateChatMessages",

  // Stock
  UpdateStockItems = "Stock:UpdateStockItems",
  UpdateStockRivens = "Stock:UpdateStockRivens",

  // User
  UpdateUser = "User:Update",

  // Live Trading
  UpdateLiveTradingRunningState = "LiveTrading:UpdateRunningState",
  OnLiveTradingError = "LiveTrading:OnError",
  OnLiveTradingMessage = "LiveTrading:OnMessage",

}

export enum QfSocketEventOperation {
  CREATE_OR_UPDATE = "CREATE_OR_UPDATE",
  DELETE = "DELETE",
  SET = "SET"
}