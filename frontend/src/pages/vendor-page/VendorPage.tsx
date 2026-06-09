import { useState, useMemo, useEffect } from "react";
import { FiUsers, FiClock, FiAlertCircle, FiCheck, FiX, FiTrash2, FiMapPin } from "react-icons/fi";
import api from "../../api/axiosInstance";
import { DashboardLayoutTemplate } from "../../components/common/Skeleton";

interface AssociatedUser {
  _id: string;
  name: string;
  email: string;
}

interface AddressStructure {
  state: string;
  city: string;
  tole: string;
}

interface Vendor {
  _id: string;
  userId?: AssociatedUser | string;
  vendorName: string;
  licenseNo?: string;
  address: AddressStructure;
  isVerified: boolean;
  isPending: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Administrative Filtering Vectors (Defaulting to 'verified' to showcase your active data)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("verified"); // 'verified' | 'pending'
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sync Resource Ledgers from Core API Endpoints
  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Route parameter splitting mapped directly to backend controller actions
      const targetEndpoint = statusFilter === "verified" ? "/vendors/verified" : "/vendors/requests";
      const res = await api.get(targetEndpoint);

      let rawData: Vendor[] = [];
      if (res.data && Array.isArray(res.data.vendors)) {
        rawData = res.data.vendors;
      } else if (res.data && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      } else if (Array.isArray(res.data)) {
        rawData = res.data; // Fallback direct array capture from payload dump
      }

      // Safe normalization: force statuses based on the structural route source if missing
      const normalizedData = rawData.map(v => ({
        ...v,
        isVerified: statusFilter === "verified" ? true : v.isVerified,
        isPending: statusFilter === "verified" ? false : v.isPending
      }));

      setVendors(normalizedData);
    } catch (err: any) {
      console.error("Vendor Matrix Synchronization Error Context:", err);
      setError(err.response?.data?.message || "Failed syncing merchant authorization data fields from gateway server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  // Safe client-side multi-property filtering layout map
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      const matchesVendorName = v.vendorName?.toLowerCase().includes(query);
      const matchesLicense = v.licenseNo?.toLowerCase().includes(query);
      
      // Prevent structural crashes if userId is passed down as an unpopulated string node
      let matchesUser = false;
      if (v.userId && typeof v.userId === "object") {
        matchesUser = 
          v.userId.name?.toLowerCase().includes(query) || 
          v.userId.email?.toLowerCase().includes(query);
      } else if (typeof v.userId === "string") {
        matchesUser = v.userId.toLowerCase().includes(query);
      }

      return matchesVendorName || matchesLicense || matchesUser;
    });
  }, [vendors, searchQuery]);

  // Client-Side Pagination Pipeline Slice
  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredVendors.slice(startIndex, startIndex + pageSize);
  }, [filteredVendors, currentPage, pageSize]);

  // Context Toggle Status Configuration Updates (PATCH /vendors/:id/toggle-verification)
  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    const message = currentStatus 
      ? "Revoke merchant authorization pipeline clearings?" 
      : "Verify vendor request? This action activates public asset indexing modules.";
    if (!window.confirm(message)) return;

    try {
      setError(null);
      const res = await api.patch(`/vendors/${id}/toggle-verification`);
      if (res.data?.success) {
        fetchVendors();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Internal context assertion constraint validation rejection.");
    }
  };

  // Permanently Drop Document Node Row (DELETE /vendors/:id)
  const handleDeleteVendor = async (id: string) => {
    if (!window.confirm("CRITICAL WARNING: This deletes this structural profile completely from system server registers.")) return;
    try {
      setError(null);
      const res = await api.delete(`/vendors/${id}`);
      if (res.data?.success) {
        fetchVendors();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed removing target database record item.");
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-danger/20 text-danger px-4 py-3.5 rounded-xl flex items-start gap-3 text-xs mb-4">
          <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Vendor Route Exception Rejection</span>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      <DashboardLayoutTemplate
        title="Admin Vendor Clearance Console"
        description="System-wide management of verified storefront vendors and corporate validation clearing queues."
        syncButtonText="Re-index Ledger Matrix"
        isLoading={isLoading}
        onSync={fetchVendors}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter current listings view by vendor name or registration metrics..."
        filterId="vendorStatusFilter"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Target Ledger Segment:"
        filterOptions={[
          { value: "verified", label: "Active Verified Directory" },
          { value: "pending", label: "Pending Requests Queue" }
        ]}
        tableHeaders={["Merchant Profile Details", "Account Owner Reference ID", "License Code Reference", "Geographic Matrix Location", "Current Clearing Status", "Actions"]}
        tableMinW="min-w-[1000px]"
        hasData={paginatedVendors.length > 0}
        totalItems={filteredVendors.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        itemLabel="vendors"
        metrics={[
          { label: "Active Stream Items Loaded", value: filteredVendors.length, icon: <FiUsers size={18} /> },
          { label: "Isolated Layout Context", value: statusFilter.toUpperCase(), icon: <FiClock size={18} />, iconBgClass: "bg-indigo-50 text-primary", valueClass: "text-primary" }
        ]}
        renderRows={() =>
          paginatedVendors.map((vendor) => (
            <tr key={vendor._id} className="hover:bg-slate-50/70 transition-colors group text-xs text-text-main">
              
              {/* Merchant Title */}
              <td className="py-4 px-6 font-bold text-text-main text-sm group-hover:text-primary transition-colors align-middle capitalize">
                {vendor.vendorName}
              </td>

              {/* Owner Account Field Link */}
              <td className="py-4 px-6 align-middle font-mono text-[11px]">
                {vendor.userId && typeof vendor.userId === "object" ? (
                  <div>
                    <span className="block font-semibold text-text-main font-sans">{vendor.userId.name}</span>
                    <span className="block text-[10px] text-text-muted mt-0.5">{vendor.userId.email}</span>
                  </div>
                ) : typeof vendor.userId === "string" ? (
                  <span className="text-text-muted bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                    User UUID: {vendor.userId.substring(0, 12)}...
                  </span>
                ) : (
                  <span className="text-text-muted italic">Unlinked Account Ref</span>
                )}
              </td>

              {/* License Badge */}
              <td className="py-4 px-6 align-middle font-mono">
                {vendor.licenseNo ? (
                  <span className="text-[11px] font-semibold tracking-wide text-indigo-600 bg-indigo-50/50 border border-indigo-100/60 px-2 py-1 rounded-md">
                    {vendor.licenseNo.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-text-muted italic bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm">Hidden on Endpoint Projection</span>
                )}
              </td>

              {/* Address Matrix Mapping */}
              <td className="py-4 px-6 align-middle font-sans text-text-muted font-medium capitalize">
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="opacity-60 text-slate-400" />
                  <span>{`${vendor.address?.tole || ""}, ${vendor.address?.city || ""}, ${vendor.address?.state || ""}`}</span>
                </div>
              </td>

              {/* Verification Toggle Status */}
              <td className="py-4 px-6 align-middle">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  vendor.isVerified ? "text-success bg-emerald-50 border-emerald-200" : "text-warning bg-amber-50 border-amber-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${vendor.isVerified ? "bg-success" : "bg-warning"}`} />
                  {vendor.isVerified ? "Verified Active" : "Pending Vetting Audit"}
                </span>
              </td>

              {/* Operational Trigger Flags */}
              <td className="py-4 px-6 align-middle text-right">
                <div className="flex items-center justify-end gap-1">
                  <button 
                    onClick={() => handleToggleVerification(vendor._id, vendor.isVerified)}
                    title={vendor.isVerified ? "Revoke Verification" : "Approve Profile Record"}
                    className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-text-main cursor-pointer"
                  >
                    {vendor.isVerified ? <FiX className="text-warning text-sm" /> : <FiCheck className="text-success text-sm" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteVendor(vendor._id)}
                    title="Purge Profile From Database Record Slots"
                    className="p-1.5 rounded bg-white border border-slate-200 hover:bg-red-50 text-danger cursor-pointer"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              </td>

            </tr>
          ))
        }
      />
    </>
  );
};

export default VendorsPage;