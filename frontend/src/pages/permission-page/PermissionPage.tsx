import { useState, useMemo, useEffect } from "react";
import { FiShield, FiSliders, FiActivity, FiMoreVertical, FiPlus, FiX, FiTrash2, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axiosInstance";
import { DashboardLayoutTemplate } from "../../components/common/Skeleton";

interface Permission {
  _id: string;
  name: string;   // e.g., "read_users", "write_books"
  group: string;  // e.g., "users", "books"
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const PermissionsPage = () => {
  // Operational Pipeline Data Streams
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Pagination Vectors Checked State Tracking
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Layout Dropdowns and Context Modals Signal Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Node Submission Form Fields Hook Bindings
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("");

  // Sync Resource Indexes with Core API Route
  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await api.get("/permissions", {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchQuery || undefined,
          group: groupFilter !== "all" ? groupFilter : undefined
        }
      });
      
      let rawData: Permission[] = [];
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      } else if (Array.isArray(res.data)) {
        rawData = res.data;
      }

      setPermissions(rawData);
      // Fallback structural bounds matching pagination engine layout meta configurations
      setTotalItems(res.data?.meta?.totalItems || rawData.length);
    } catch (err: any) {
      console.error("Failed synchronizing critical authorization matrix:", err);
      setError(err.response?.data?.message || "Unable to synchronize explicit authorization rules index.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [currentPage, pageSize, groupFilter, searchQuery]);

  // Compute Functional Summary Metadata Grid Metrics Row
  const metrics = useMemo(() => {
    const total = permissions.length;
    const uniqueGroups = new Set(permissions.map((p) => p.group).filter(Boolean)).size;
    return { total, uniqueGroups };
  }, [permissions]);

  // Extract list parameters to assign targeted side layout component filter selections
  const uniqueGroupsList = useMemo(() => {
    const groups = permissions.map((p) => p.group).filter(Boolean);
    return Array.from(new Set(groups)).sort();
  }, [permissions]);

  // Register New Capability Rule Context Execution (POST /permissions)
  const handleRegisterPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newGroup.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await api.post("/permissions", {
        name: newName.toLowerCase().trim(),
        group: newGroup.toLowerCase().trim()
      });

      setIsModalOpen(false);
      setNewName("");
      setNewGroup("");
      fetchPermissions(); // Force immediate update layout sequencing
    } catch (err: any) {
      console.error("Permission registration block error context:", err);
      setError(err.response?.data?.message || "Failed to commit system rule signature mapping context.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wipe Out Security Token Rule Hook Execution (DELETE /permissions/:id)
  const handleDeletePermission = async (id: string) => {
    if (!window.confirm("Are you completely certain you want to purge this system validation guard? Active roles utilizing this slug index might breakdown.")) return;
    try {
      await api.delete(`/permissions/${id}`);
      setActiveDropdownId(null);
      fetchPermissions();
    } catch (err: any) {
      console.error("Rule termination runtime exception:", err);
      setError(err.response?.data?.message || "Internal context permission constraint assertion rejection.");
    }
  };

  const formatPermissionName = (name: string) => {
    if (!name) return "";
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const generateActionContext = (name: string, group: string) => {
    const action = name.split("_")[0];
    switch (action.toLowerCase()) {
      case "read":
        return `Grants authorization to inspect and retrieve ${group} records list layouts.`;
      case "write":
        return `Grants full authorization to initialize modifications or compile new entries inside the ${group} directory.`;
      case "delete":
        return `Elevated access key: Authorizes processing destructive deletions inside the ${group} collection.`;
      case "verify":
        return `Quality assurance privilege: Controls compliance processing and vetting status of target ${group}.`;
      case "approve":
        return `High-tier supervisor validation token: Authorizes vetting and signing merchant onboarding requests.`;
      default:
        return `Custom application scope rule controlling actions inside the ${group} matrix context.`;
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-danger/20 text-danger px-4 py-3.5 rounded-xl flex items-start gap-3 text-xs mb-4">
          <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Ecosystem Gateway Rejection</span>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      <DashboardLayoutTemplate
        title="Access Control Permissions"
        description="System-wide granular validation rules and system action capabilities matching active gateway middleware clearings."
        syncButtonText="Refresh Rules Ledger"
        isLoading={isLoading}
        onSync={fetchPermissions}
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        searchPlaceholder="Search key rules, functional slugs, database hex hashes..."
        filterId="permissionGroupFilter"
        filterValue={groupFilter}
        onFilterChange={(val) => { setGroupFilter(val); setCurrentPage(1); }}
        filterLabel="Domain Scope:"
        filterOptions={[
          { value: "all", label: "All Architectural Domains" },
          ...uniqueGroupsList.map((g) => ({ value: g, label: `${g.toUpperCase()} Scope` }))
        ]}
        tableHeaders={["Permission Capability", "Functional System Slug Key", "System ID Reference", "Domain Cluster", "Actions"]}
        tableMinW="min-w-[950px]"
        hasData={permissions.length > 0}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        itemLabel="permissions"
        metrics={[
          { label: "Active Guards Loaded", value: metrics.total, icon: <FiShield size={18} /> },
          { label: "Isolated Domain Scopes", value: metrics.uniqueGroups, icon: <FiSliders size={18} />, iconBgClass: "bg-indigo-50 text-primary", valueClass: "text-primary" },
          { label: "API Gateway Integration", value: "100%", icon: <FiActivity size={18} />, iconBgClass: "bg-emerald-50 text-success", valueClass: "text-success" }
        ]}
        actionButton={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-primary text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-600/10 hover:bg-primary-hover transition-all cursor-pointer select-none"
          >
            <FiPlus className="text-sm" />
            <span>Register Permission Node</span>
          </button>
        }
        renderRows={() =>
          permissions.map((perm) => (
            <tr key={perm._id} className="hover:bg-slate-50/70 transition-colors group text-xs text-text-main relative">
              
              {/* Formatted Functional Title */}
              <td className="py-4 px-6 font-bold text-text-main text-sm group-hover:text-primary transition-colors align-middle">
                <div>
                  <span className="block font-sans tracking-wide">{formatPermissionName(perm.name)}</span>
                  <span className="block text-[10px] text-text-muted font-medium mt-0.5 max-w-sm whitespace-normal leading-relaxed">
                    {generateActionContext(perm.name, perm.group)}
                  </span>
                </div>
              </td>

              {/* Micro Snake Case Token Identifier */}
              <td className="py-4 px-6 align-middle font-mono">
                <span className="text-[11px] font-semibold tracking-wide text-indigo-600 bg-indigo-50/50 border border-indigo-100/60 px-2 py-1 rounded-md">
                  {perm.name}
                </span>
              </td>

              {/* Clean System Hex ID Badging */}
              <td className="py-4 px-6 align-middle font-mono text-text-muted text-[10px]">
                <span>#{perm._id.substring(perm._id.length - 8).toUpperCase()}</span>
              </td>

              {/* Cluster Domain Label Tag */}
              <td className="py-4 px-6 align-middle">
                <span className="bg-slate-100 border border-slate-200 text-text-main font-sans px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  {perm.group}
                </span>
              </td>

              {/* Action Popup Sub-menu Grid Options */}
              <td className="py-4 px-6 text-right align-middle relative">
                <div className="inline-block text-left">
                  <button 
                    onClick={() => setActiveDropdownId(activeDropdownId === perm._id ? null : perm._id)}
                    className="text-text-muted hover:text-text-main p-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <FiMoreVertical className="text-sm" />
                  </button>

                  {activeDropdownId === perm._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden font-sans text-xs">
                        <button 
                          onClick={() => handleDeletePermission(perm._id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 font-medium text-danger transition-colors"
                        >
                          <FiTrash2 />
                          <span>Purge Security Guard</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))
        }
      />

      {/* ----------------- REGISTER PERMISSION SLIP MODAL OVERLAY ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl shadow-2xl overflow-hidden font-sans">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FiShield className="text-primary text-base" />
                <h3 className="text-sm font-bold text-heading">Instantiate Middleware Permission</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main p-1 rounded-md transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterPermission} className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Capability Key Slug *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. read_books, verify_vendors, purge_roles"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium lowercase"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Taxonomic Domain Scope Group *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. books, vendors, user_profiles"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium lowercase"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 border border-slate-200 text-text-main font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isSubmitting ? "Broadcasting Core Signatures..." : "Inject Control Rule"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default PermissionsPage;