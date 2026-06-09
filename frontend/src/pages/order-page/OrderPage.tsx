import { useState, useMemo, useEffect } from "react";
import { 
  FiMoreVertical, 
  FiShoppingBag, 
  FiClock, 
  FiPackage, 
  FiTrendingUp 
} from "react-icons/fi";
import api from "../../api/axiosInstance";
import { DashboardLayoutTemplate } from "../../components/common/Skeleton";

interface BookItem {
  inventoryId: string;
  bookId: {
    coverImage: { imageUrl: string; publicId: string; };
    _id: string; name: string; isbn: string;
    author: { _id: string; name: string; };
  };
  vendorId: string; quantity: number; price: number; subTotal: number;
}

interface Address { state: string; city: string; tole: string; }

interface Order {
  _id: string;
  userId: { _id: string; name: string; email: string; };
  shippingAddress: Address; billingAddress: Address;
  books: BookItem[]; vendorSubTotal: number; deliveryCharge: number; grandTotal: number;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string; updatedAt: string;
}

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/orders/vendor");
      if (res.data?.orders) setOrders(res.data.orders);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const metrics = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.totalOrders += 1;
        if (order.orderStatus !== "cancelled") acc.totalRevenue += order.vendorSubTotal;
        if (order.orderStatus === "pending") acc.pendingOrders += 1;
        return acc;
      },
      { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 }
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) || order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && (statusFilter === "all" || order.orderStatus === statusFilter);
    });
  }, [orders, searchQuery, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  return (
    <DashboardLayoutTemplate
      title="Vendor Orders"
      description="Track incoming customer purchasing routes, export logistical parameters, and modify fulfillment steps."
      syncButtonText="Refresh Orders"
      isLoading={isLoading}
      onSync={fetchOrders}
      searchQuery={searchQuery}
      onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
      searchPlaceholder="Search matching order transactions via customer name, email, or order ID hash..."
      filterId="orderStatusFilter"
      filterValue={statusFilter}
      onFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
      filterLabel="Fulfillment State:"
      filterOptions={[
        { value: "all", label: "All Order Milestones" },
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" }
      ]}
      tableHeaders={["Order Identification", "Purchased Catalog Items", "Net Yield", "Fulfillment Milestone", "Financial Settlement", "Actions"]}
      hasData={filteredOrders.length > 0}
      totalItems={filteredOrders.length}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
      itemLabel="orders"
      emptyIcon={<FiShoppingBag className="text-3xl mx-auto mb-3 text-text-muted/40" />}
      emptyTitle="No purchase orders located"
      metrics={[
        { label: "Incoming Receipts", value: metrics.totalOrders, icon: <FiPackage size={20} /> },
        { label: "Gross Yield Volume", value: `Rs. ${metrics.totalRevenue.toLocaleString()}`, icon: <FiTrendingUp size={20} />, iconBgClass: "bg-emerald-50 text-success", valueClass: "text-success" },
        { label: "Awaiting Dispatch", value: metrics.pendingOrders, icon: <FiClock size={20} />, iconBgClass: metrics.pendingOrders > 0 ? "bg-amber-50 text-warning" : "bg-slate-100 text-slate-400", valueClass: metrics.pendingOrders > 0 ? "text-warning" : "" }
      ]}
      renderRows={() =>
        paginatedOrders.map((order) => (
          <tr key={order._id} className="hover:bg-slate-50/70 transition-colors group text-xs text-text-main">
            <td className="py-4 px-6 space-y-1.5 align-top">
              <span className="font-mono font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md inline-block">
                #{order._id.substring(order._id.length - 8).toUpperCase()}
              </span>
              <div>
                <span className="font-bold block text-sm">{order.userId?.name || "Guest Account"}</span>
                <span className="text-text-muted block text-[11px] font-medium">{order.userId?.email}</span>
              </div>
            </td>
            <td className="py-4 px-6 align-top">
              <div className="divide-y divide-slate-100 max-w-xs">
                {order.books?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 py-1.5 first:pt-0">
                    <img src={item.bookId?.coverImage?.imageUrl || "https://placehold.co/70x100"} alt="" className="w-6 h-9 rounded-md border" />
                    <span className="truncate block font-semibold">{item.bookId?.name}</span>
                  </div>
                ))}
              </div>
            </td>
            <td className="py-4 px-6 text-right font-bold text-sm align-top">Rs. {order.vendorSubTotal.toLocaleString()}</td>
            <td className="py-4 px-6 align-top text-center"><span className="capitalize font-bold">{order.orderStatus}</span></td>
            <td className="py-4 px-6 align-top text-center"><span className="font-bold uppercase text-[10px]">{order.paymentStatus}</span></td>
            <td className="py-4 px-6 text-right align-top"><button className="text-text-muted p-2 rounded-lg hover:bg-slate-100"><FiMoreVertical /></button></td>
          </tr>
        ))
      }
    />
  );
};

export default OrderPage;