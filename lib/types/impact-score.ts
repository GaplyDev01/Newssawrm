export interface ImpactFactor {
  id: string
  name: string
  description: string
  category: "market" | "technical" | "personal"
  icon: string
  defaultWeight: number
}

export const defaultImpactFactors: ImpactFactor[] = [
  {
    id: "market_volatility",
    name: "Market Volatility",
    description: "How much the news affects market price movements and trading patterns",
    category: "market",
    icon: "trending-up",
    defaultWeight: 85,
  },
  {
    id: "trading_volume",
    name: "Trading Volume",
    description: "Impact on trading volumes across exchanges and liquidity pools",
    category: "market",
    icon: "bar-chart",
    defaultWeight: 80,
  },
  {
    id: "regulatory_implications",
    name: "Regulatory Implications",
    description: "Potential effects on regulatory frameworks and compliance requirements",
    category: "market",
    icon: "shield",
    defaultWeight: 75,
  },
  {
    id: "technology_advancement",
    name: "Technology Advancement",
    description: "Significance of technological innovations and protocol improvements",
    category: "technical",
    icon: "cpu",
    defaultWeight: 70,
  },
  {
    id: "network_security",
    name: "Network Security",
    description: "Implications for blockchain security, vulnerabilities, and risk profiles",
    category: "technical",
    icon: "lock",
    defaultWeight: 85,
  },
  {
    id: "adoption_metrics",
    name: "Adoption Metrics",
    description: "Effects on user adoption, active addresses, and network usage",
    category: "technical",
    icon: "users",
    defaultWeight: 65,
  },
  {
    id: "portfolio_relevance",
    name: "Portfolio Relevance",
    description: "Relevance to assets in your portfolio or watchlist",
    category: "personal",
    icon: "briefcase",
    defaultWeight: 90,
  },
  {
    id: "industry_focus",
    name: "Industry Focus",
    description: "Alignment with your industry interests and professional needs",
    category: "personal",
    icon: "target",
    defaultWeight: 75,
  },
  {
    id: "geographic_relevance",
    name: "Geographic Relevance",
    description: "Relevance to your geographic region and market focus",
    category: "personal",
    icon: "globe",
    defaultWeight: 60,
  },
]
