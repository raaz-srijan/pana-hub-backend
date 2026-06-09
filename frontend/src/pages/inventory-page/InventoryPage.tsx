import { useState, useMemo, useEffect } from "react";
import { 
  FiMoreVertical, 
  FiAlertTriangle, 
  FiLayers, 
  FiDollarSign, 
  FiBox, 
} from "react-icons/fi";
import api from "../../api/axiosInstance";
import { DashboardLayoutTemplate } from "../../components/common/Skeleton";

interface BookDetails {
  coverImage: { imageUrl: string; publicId: string; };
  _id: string; name: string; isbn: string;
  category: { _id: string; name: string; };
  author: { _id: string; name: string; };
}

interface InventoryItem {
  _id: string; vendorId: string; bookId: BookDetails;
  price: number; stock: number; isActive: boolean; stockReminder: number;
  createdAt: string; updatedAt: string; __v: number;
}

const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/inventory/own");
      if (res.data?.data) setInventory(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const metrics = useMemo(() => {
    return inventory.reduce(
      (acc, item) => {
        acc.totalTitles += 1;
        acc.totalVolume += item.stock;
        acc.valuation += item.price * item.stock;
        if (item.stock <= item.stockReminder) acc.lowStockAlerts += 1;
        return acc;
      },
      { totalTitles: 0, totalVolume: 0, valuation: 0, lowStockAlerts: 0 }
    );
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const book = item.bookId;
      const matchesSearch = book?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || book?.isbn?.includes(searchQuery);
      const matchesStock = stockFilter === "all" || (stockFilter === "low" && item.stock <= item.stockReminder) || (stockFilter === "healthy" && item.stock > item.stockReminder);
      return matchesSearch && matchesStock;
    });
  }, [inventory, searchQuery, stockFilter]);

  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredInventory.slice(startIndex, startIndex + pageSize);
  }, [filteredInventory, currentPage, pageSize]);

  return (
    <DashboardLayoutTemplate
      title="Stock & Inventory"
      description="Monitor stock counts, tracking alert margins, asset activation, and book valuation metrics."
      syncButtonText="Sync Stock Data"
      isLoading={isLoading}
      onSync={fetchInventory}
      searchQuery={searchQuery}
      onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
      searchPlaceholder="Search matching stock item via title, author, or ISBN..."
      filterId="stockStatusFilter"
      filterValue={stockFilter}
      onFilterChange={(val) => { setStockFilter(val); setCurrentPage(1); }}
      filterLabel="Stock State:"
      filterOptions={[
        { value: "all", label: "All Levels" },
        { value: "low", label: "⚠️ Low Stock Alerts" },
        { value: "healthy", label: "✓ Healthy Volumes" }
      ]}
      tableHeaders={["Book Particulars", "Author & Class", "Price per Unit", "Remaining Stock", "Store Display", "Actions"]}
      hasData={filteredInventory.length > 0}
      totalItems={filteredInventory.length}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
      itemLabel="items"
      metrics={[
        { label: "Managed Titles", value: metrics.totalTitles, icon: <FiLayers size={20} />, iconBgClass: "bg-indigo-50 text-primary" },
        { label: "Total Book Volume", value: `${metrics.totalVolume} units`, icon: <FiBox size={20} /> },
        { label: "Stock Valuation", value: `$${metrics.valuation.toLocaleString()}`, icon: <FiDollarSign size={20} />, iconBgClass: "bg-emerald-50 text-success" },
        { label: "Low Stock Alerts", value: `${metrics.lowStockAlerts} items`, icon: <FiAlertTriangle size={20} />, iconBgClass: metrics.lowStockAlerts > 0 ? "bg-amber-50 text-warning" : "bg-slate-100 text-slate-400", valueClass: metrics.lowStockAlerts > 0 ? "text-warning" : "" }
      ]}
      renderRows={() =>
        paginatedInventory.map((item) => (
          <tr key={item._id} className="hover:bg-slate-50/70 transition-colors group text-xs text-text-main">
            <td className="py-4 px-6 max-w-xs">
              <div className="flex items-center gap-4">
                <img src={item.bookId?.coverImage?.imageUrl || "https://placehold.co/70x100"} alt="" className="w-8 h-11 object-cover rounded-md border border-slate-200" />
                <div className="truncate"><span className="font-bold block truncate text-sm">{item.bookId?.name}</span><span className="font-mono text-[10px] text-text-muted bg-slate-100 px-1.5 py-0.5 rounded-sm">ISBN: {item.bookId?.isbn}</span></div>
              </div>
            </td>
            <td className="py-4 px-6">
              <span className="font-semibold block">{item.bookId?.author?.name}</span>
              <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">{item.bookId?.category?.name}</span>
            </td>
            <td className="py-4 px-6 text-right font-bold text-sm">${item.price}</td>
            <td className="py-4 px-6 text-center">
              <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${item.stock <= item.stockReminder ? "bg-amber-50 text-warning" : "bg-slate-100"}`}>{item.stock} units</span>
            </td>
            <td className="py-4 px-6 text-center">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.isActive ? "text-success bg-emerald-50 border-emerald-200" : "text-text-muted bg-slate-50 border-slate-200"}`}>
                {item.isActive ? "Live" : "Paused"}
              </span>
            </td>
            <td className="py-4 px-6 text-right">
              <button className="text-text-muted p-2 rounded-lg hover:bg-slate-100"><FiMoreVertical /></button>
            </td>
          </tr>
        ))
      }
    />
  );
};

export default InventoryPage;
