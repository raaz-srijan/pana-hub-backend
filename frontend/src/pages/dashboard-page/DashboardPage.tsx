import { useState, useEffect, useMemo } from "react";
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag, 
  FiLayers, FiUsers, FiCpu, FiAlertTriangle, FiBookOpen, 
  FiCalendar, FiRefreshCw, FiMapPin 
} from "react-icons/fi";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../redux/authStore";

interface TrendNode {
  date: string;
  revenue: number;
  orderCount?: number;
  quantitySold?: number;
}

interface TopBookNode {
  bookId: string;
  name: string;
  isbn?: string;
  coverImage?: string;
  authorName?: string;
  quantitySold: number;
  revenue: number;
}

interface TopCategoryNode {
  categoryId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

interface TopVendorNode {
  vendorId: string;
  vendorName: string;
  quantitySold: number;
  revenue: number;
}

interface StatusCountNode {
  status: string;
  count: number;
}

interface LowStockNode {
  inventoryId: string;
  bookId: string;
  name: string;
  isbn?: string;
  coverImage?: string;
  price: number;
  stock: number;
  stockReminder: number;
}

interface DashboardAnalyticsData {
  overview: {
    totalRevenue: number;
    totalBookSales?: number;
    totalOrders: number;
    totalBooks?: number;
    totalUsers?: number;
    totalVendors?: number;
    totalBooksInInventory?: number;
    lowStockAlertCount?: number;
  };
  salesTrend: TrendNode[];
  topBooks: TopBookNode[];
  topCategories?: TopCategoryNode[];
  topVendors?: TopVendorNode[];
  orderStatuses: StatusCountNode[];
  inventoryHealth?: {
    activeCount: number;
    inactiveCount: number;
    totalStockCount: number;
    totalStockValue: number;
    lowStockItems: LowStockNode[];
  };
}

const DashboardPage = () => {
  const { user } = useAuthStore();
  const role = user?.role || "customer";

  // Framework Data Hooks
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Time boundaries defaults to trailing 30-day index windows (YYYY-MM-DD formatting string)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const fetchDashboardAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Branch target gateway endpoints securely based on user profile context
      const targetEndpoint = role === "admin" ? "/analytics/admin/dashboard" : "/analytics/vendor/dashboard";
      
      const res = await api.get(targetEndpoint, {
        params: { startDate, endDate }
      });

      // Track response data layouts securely
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error("Dashboard Analytics Compilation Failure Exception:", err);
      setError(err.response?.data?.message || "Failed syncing ecosystem analytics stream metrics from gateway core.");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run the aggregation pipelines when parameters change
  useEffect(() => {
    if (role === "admin" || role === "vendor") {
      fetchDashboardAnalytics();
    }
  }, [role, startDate, endDate]);

  // Handle direct cross-origin role isolation routing
  if (role !== "admin" && role !== "vendor") {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm max-w-md mx-auto mt-20 font-sans">
        <FiAlertTriangle className="text-warning text-4xl mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Access Violation Authorization Blocked</h3>
        <p className="text-xs text-slate-500 mt-1">This control ledger is reserved exclusively for validated administrator accounts and vendor tenants.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans text-xs text-slate-700">
      
      {/* HEADER CONTROLS VIEWPORT LAYER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight capitalize">
            {role === "admin" ? "Ecosystem Command Dashboard" : "Merchant Ledger Console"}
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Real-time metric monitoring tracking business transactions, volume health indices, and document flows.
          </p>
        </div>

        {/* TIME CONTROLS BARS PIPELINE */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium">
            <FiCalendar size={13} />
            <span>Aggregation Windows:</span>
          </div>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent border border-slate-200 hover:border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
          />
          <span className="text-slate-400 font-bold font-mono">→</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent border border-slate-200 hover:border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
          />
          <button 
            onClick={fetchDashboardAnalytics}
            disabled={isLoading}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all cursor-pointer"
            title="Force recalculate ledger pipelines"
          >
            <FiRefreshCw className={`text-sm ${isLoading ? "animate-spin text-indigo-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* CORE ALERTS OVERLAYS */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200/60 rounded-xl text-red-700 flex items-start gap-3">
          <FiAlertTriangle className="flex-shrink-0 mt-0.5 text-sm" />
          <div>
            <span className="font-bold block">Aggregation Interceptor Middleware Rejection</span>
            <p className="text-[11px] opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ==========================================
          METRIC GRID CHANNELS 
         ========================================== */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* CARD 1: Financial Balance */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Aggregated Gross Revenue</span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1 font-sans">
                ${data.overview.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <FiDollarSign size={20} />
            </div>
          </div>

          {/* CARD 2: Volume Velocity */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Processed Orders Count</span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                {data.overview.totalOrders?.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
              <FiShoppingBag size={20} />
            </div>
          </div>

          {/* CONDITIONAL BRANCH CARDS: ADMIN VIEWS */}
          {role === "admin" && (
            <>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Registered Users Directory</span>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">{data.overview.totalUsers ?? 0}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                  <FiUsers size={20} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Verified Merchant Tenants</span>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">{data.overview.totalVendors ?? 0}</h3>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition-transform">
                  <FiCpu size={20} />
                </div>
              </div>
            </>
          )}

          {/* CONDITIONAL BRANCH CARDS: VENDOR VIEWS */}
          {role === "vendor" && (
            <>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Catalog Inventory Sku Slots</span>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">{data.overview.totalBooksInInventory ?? 0}</h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
                  <FiLayers size={20} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Low Stock Sku Triggers</span>
                  <h3 className={`text-xl font-extrabold tracking-tight mt-1 ${data.overview.lowStockAlertCount && data.overview.lowStockAlertCount > 0 ? "text-red-600 animate-pulse" : "text-slate-900"}`}>
                    {data.overview.lowStockAlertCount ?? 0}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl group-hover:scale-105 transition-transform ${data.overview.lowStockAlertCount && data.overview.lowStockAlertCount > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                  <FiAlertTriangle size={20} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==========================================
          SECONDARY CHARTS & TABLES INFRASTRUCTURE 
         ========================================== */}
      {data && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT/CENTER STACK MATRIX VIEWPORTS */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* COMPONENT: Sales Trend Line Visualizer */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-indigo-500" />
                <span>Financial Transactions Trend Velocity Ledger</span>
              </h2>
              {data.salesTrend?.length > 0 ? (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 font-mono text-[11px]">
                  <div className="grid grid-cols-3 bg-slate-50 p-2 rounded-lg font-sans font-bold text-slate-500 uppercase tracking-wider">
                    <span>Date Context Node</span>
                    <span className="text-right">Transaction Volume</span>
                    <span className="text-right">Gross Clearing Revenue</span>
                  </div>
                  {data.salesTrend.map((trend, index) => (
                    <div key={index} className="grid grid-cols-3 p-2 border-b border-slate-100 items-center hover:bg-slate-50/60 transition-all">
                      <span className="font-semibold text-slate-700">{trend.date}</span>
                      <span className="text-right font-medium text-slate-500">{trend.orderCount ?? trend.quantitySold ?? 0} items</span>
                      <span className="text-right text-emerald-600 font-bold">${trend.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 font-medium italic">No tracking trend vector calculations matched during target frame window.</div>
              )}
            </div>

            {/* COMPONENT: Top Moving Sku Books Inventory Table */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <FiBookOpen className="text-purple-500" />
                <span>Top Performing Catalog Asset Profiles (Top 5)</span>
              </h2>
              {data.topBooks?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                        <th className="py-2.5 px-3">Title Asset Meta</th>
                        <th className="py-2.5 px-3 text-right">Units Dispatched</th>
                        <th className="py-2.5 px-3 text-right">Yield Capitalization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.topBooks.map((book, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {book.coverImage ? (
                                <img src={book.coverImage} alt="" className="w-7 h-9 object-cover rounded shadow-sm border border-slate-200 bg-slate-100" />
                              ) : (
                                <div className="w-7 h-9 bg-slate-100 rounded border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-[9px] uppercase font-mono">BK</div>
                              )}
                              <div>
                                <span className="block font-bold text-slate-800 text-xs truncate max-w-xs">{book.name || "Unknown Asset"}</span>
                                <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                  {book.authorName ? `by ${book.authorName}` : book.isbn ? `ISBN: ${book.isbn}` : "No verification metadata tags found"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-600">{book.quantitySold} units</td>
                          <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">${book.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 font-medium italic">Zero volume item sales indexed.</div>
              )}
            </div>

            {/* CONDITIONAL LAYER: VENDOR LOW STOCK DIRECT MONITOR AGENTS */}
            {role === "vendor" && data.inventoryHealth && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
                  <FiAlertTriangle className="text-red-500" />
                  <span>Inventory Pipeline Alert Vitals (Low Stock Warnings)</span>
                </h2>
                {data.inventoryHealth.lowStockItems?.length > 0 ? (
                  <div className="space-y-2">
                    {data.inventoryHealth.lowStockItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-red-50/40 hover:bg-red-50 border border-red-100/60 rounded-xl transition-all">
                        <div>
                          <span className="font-bold block text-slate-800 text-xs">{item.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Unit Value Reference: ${item.price.toFixed(2)} | Sku Tracking ID: #{item.inventoryId.substring(item.inventoryId.length - 6).toUpperCase()}</span>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-red-100 border border-red-200 text-red-700">
                            {item.stock} / {item.stockReminder} remaining
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-emerald-600 font-bold bg-emerald-50 rounded-xl border border-emerald-200/50">
                    Perfect Alignment Checklist. All active listed catalog SKUs rest above configured safety reminder thresholds.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR COMPONENT PANEL HOOKS */}
          <div className="space-y-6">
            
            {/* SUMMARY STATS CARD MODULE CONTAINER */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4">
                Ecosystem Lifecycle Status Distribution
              </h2>
              {data.orderStatuses?.length > 0 ? (
                <div className="space-y-2.5">
                  {data.orderStatuses.map((stat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span className="capitalize tracking-wide font-semibold text-slate-600">{stat.status || "Unspecified Route State"}</span>
                        <span className="font-mono font-bold text-slate-900">{stat.count} orders</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            stat.status === "completed" || stat.status === "delivered" ? "bg-emerald-500" :
                            stat.status === "pending" || stat.status === "processing" ? "bg-amber-500" : "bg-slate-400"
                          }`}
                          style={{ width: `${Math.min((stat.count / Math.max(data.overview.totalOrders, 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 italic">No historical route records found across active time frame segments.</div>
              )}
            </div>

            {/* CONDITIONAL LAYERS BRANCHES: ADMIN METRICS MATRICES */}
            {role === "admin" && data.topCategories && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-3">Top Volume Market Verticals</h2>
                <div className="space-y-2.5">
                  {data.topCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-slate-300 transition-all">
                      <div>
                        <span className="font-bold text-slate-800 capitalize text-xs block">{cat.name || "Generic Category"}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{cat.quantitySold} copies dispatched</span>
                      </div>
                      <span className="font-mono font-black text-slate-800 text-xs">${cat.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {role === "admin" && data.topVendors && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-3">Top Market Merchant Partners</h2>
                <div className="space-y-2.5">
                  {data.topVendors.map((vend, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-slate-300 transition-all">
                      <div>
                        <span className="font-bold text-slate-800 capitalize text-xs block">{vend.vendorName || "Partner Tenant Node"}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{vend.quantitySold} processing handshakes</span>
                      </div>
                      <span className="font-mono font-black text-indigo-600 text-xs">${vend.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONDITIONAL LAYERS BRANCHES: VENDOR INVENTORY FINANCIAL ANALYSIS VIEWS */}
            {role === "vendor" && data.inventoryHealth && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-indigo-100">
                <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-4">Stock Ledger Valuation Financial Matrix</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-indigo-200 text-[10px] block font-medium">Aggregate Assets Count</span>
                    <span className="text-lg font-black block mt-1 font-mono">{data.inventoryHealth.totalStockCount?.toLocaleString()}</span>
                    <span className="text-[10px] text-indigo-300 mt-0.5 block">{data.inventoryHealth.activeCount} active SKUs</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-indigo-200 text-[10px] block font-medium">Financial Valuation Holdings</span>
                    <span className="text-lg font-black block mt-1 font-mono text-emerald-400">${data.inventoryHealth.totalStockValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{data.inventoryHealth.inactiveCount} shelf archived</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default DashboardPage;