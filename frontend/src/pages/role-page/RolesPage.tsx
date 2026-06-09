import { useState, useMemo, useEffect } from "react";
import { FiUsers, FiShield, FiSettings, FiMoreVertical, FiPlus, FiX, FiTrash2, FiCheck, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axiosInstance";
import { DashboardLayoutTemplate } from "../../components/common/Skeleton";

interface Role {
  _id: string; name: string; permissions: string[]; 
  createdAt: string; updatedAt: string; __v: number;
}

// Lightweight schema map representing systemic directive configurations
interface Permission {
  _id: string;
  name: string;
  module?: string;
}

const RolesPage = () => {
  // Primary Resource State Hooks
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsPool, setPermissionsPool] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Operational Filtering Vectors
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Layout Dropdown & Context Drawer State Signals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Role Form Field State Bindings
  const [newName, setNewName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Sync Resource Collection Matrices from Backend Endpoint (GET /roles)
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/roles");
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setRoles(res.data.data);
      } else if (Array.isArray(res.data)) {
        setRoles(res.data);
      }
    } catch (err: any) {
      console.error("Failed pulling authorization group matrices:", err);
      setError("Unable to load role security profiles from framework ledger.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pull Systemic Permissions when initializing custom definition creation drawer
  const fetchPermissionsPool = async () => {
    try {
      // Points toward your standard permissions index matching PermissionService
      const res = await api.get("/permissions"); 
      const rawData = res.data?.data || res.data?.permissions || res.data;
      if (Array.isArray(rawData)) {
        setPermissionsPool(rawData);
      }
    } catch (err) {
      console.error("Could not fetch downstream authorization markers:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Sync permissions option values if the modal layout demands it
  useEffect(() => {
    if (isModalOpen && permissionsPool.length === 0) {
      fetchPermissionsPool();
    }
  }, [isModalOpen]);

  // Utility checking signature immutability parameters
  const isCoreSystemRole = (name: string) => {
    const baseline = ["admin", "vendor", "customer"];
    return baseline.includes(name.toLowerCase().trim());
  };

  // Compute Layout Metrics dynamically
  const metrics = useMemo(() => {
    const total = roles.length;
    const systemProtected = roles.filter((r) => isCoreSystemRole(r.name)).length;
    return { total, systemProtected, custom: total - systemProtected };
  }, [roles]);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch = 
        role.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role._id?.toLowerCase().includes(searchQuery.toLowerCase());

      const isSystem = isCoreSystemRole(role.name);
      const matchesType = 
        typeFilter === "all" ||
        (typeFilter === "system" && isSystem) ||
        (typeFilter === "custom" && !isSystem);

      return matchesSearch && matchesType;
    });
  }, [roles, searchQuery, typeFilter]);

  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRoles.slice(startIndex, startIndex + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  // Create & Transmit Role Configurations Payload (POST /roles)
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await api.post("/roles", {
        name: newName.trim(),
        permissions: selectedPermissions // Array of validated ObjectIDs
      });

      setIsModalOpen(false);
      setNewName("");
      setSelectedPermissions([]);
      fetchRoles();
    } catch (err: any) {
      console.error("Role creation transaction error:", err);
      setError(err.response?.data?.message || "Failed to establish custom authorization role profiling.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Erase Custom Workspace Roles Node (DELETE /roles/:id)
  const handleDeleteRole = async (id: string) => {
    if (!window.confirm("Are you certain you wish to wipe this custom security context profile out of system core definitions?")) return;
    try {
      await api.delete(`/roles/${id}`);
      setActiveDropdownId(null);
      fetchRoles();
    } catch (err: any) {
      console.error("Failed to delete role:", err);
      setError(err.response?.data?.message || "Internal permissions model constraint failure.");
    }
  };

  // Toggle collection checkbox indexes safely
  const togglePermissionSelection = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const getRoleDescription = (name: string) => {
    switch (name.toLowerCase()) {
      case "admin":
        return "Root core supervisor profile with read/write administrative clearance vectors.";
      case "vendor":
        return "Merchant workspace user with specific catalog asset modification scopes.";
      case "customer":
        return "Standard buyer identity role matching storefront commerce checkout rules.";
      default:
        return "Custom operational workspace group context policy.";
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-danger/20 text-danger px-4 py-3.5 rounded-xl flex items-start gap-3 text-xs mb-4">
          <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Security Context Violation</span>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      <DashboardLayoutTemplate
        title="Security Roles Configuration"
        description="Manage institutional access profiles, workspace structures, and systemic capability mappings."
        syncButtonText="Synchronize Profile Index"
        isLoading={isLoading}
        onSync={fetchRoles}
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        searchPlaceholder="Search matching role profiles, structural system keys, identifiers..."
        filterId="roleOriginFilter"
        filterValue={typeFilter}
        onFilterChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
        filterLabel="Role Signature:"
        filterOptions={[
          { value: "all", label: "All Structural Signatures" },
          { value: "system", label: "Immutable System Protected" },
          { value: "custom", label: "User Defined Custom" }
        ]}
        tableHeaders={["Workspace Profile Role", "Internal System ID Index", "Assigned Directives Map", "Classification Origin", "Actions"]}
        tableMinW="min-w-[850px]"
        hasData={paginatedRoles.length > 0}
        totalItems={filteredRoles.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        itemLabel="roles"
        metrics={[
          { label: "Total Profiles Registered", value: metrics.total, icon: <FiUsers size={18} /> },
          { label: "Protected Framework Defaults", value: metrics.systemProtected, icon: <FiSettings size={18} />, iconBgClass: "bg-indigo-50 text-primary", valueClass: "text-primary" },
          { label: "Custom Tenant Schemes", value: metrics.custom, icon: <FiShield size={18} />, iconBgClass: "bg-amber-50 text-warning", valueClass: "text-warning" }
        ]}
        actionButton={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-primary text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-600/10 hover:bg-primary-hover transition-all cursor-pointer select-none"
          >
            <FiPlus className="text-sm" />
            <span>Add Strategic Role</span>
          </button>
        }
        renderRows={() =>
          paginatedRoles.map((role) => {
            const ruleSetCount = role.permissions?.length || 0;
            const isSystem = isCoreSystemRole(role.name);

            return (
              <tr key={role._id} className="hover:bg-slate-50/70 transition-colors group text-xs text-text-main relative">
                
                {/* Identity Column */}
                <td className="py-4 px-6 font-bold text-text-main text-sm group-hover:text-primary transition-colors align-middle">
                  <div>
                    <span className="capitalize block font-sans tracking-wide">{role.name}</span>
                    <span className="block text-[10px] text-text-muted font-normal mt-0.5 max-w-sm whitespace-normal leading-relaxed">
                      {getRoleDescription(role.name)}
                    </span>
                  </div>
                </td>

                {/* Unique Target Hex ID Token */}
                <td className="py-4 px-6 align-middle">
                  <span className="font-mono text-[10px] text-text-muted bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm tracking-wide">
                    #{role._id.substring(role._id.length - 8).toUpperCase()}
                  </span>
                </td>

                {/* Directives Counter Array Badge */}
                <td className="py-4 px-6 align-middle font-sans font-semibold">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center font-mono rounded text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                      ruleSetCount > 10 
                        ? "bg-indigo-50 text-primary border border-indigo-100" 
                        : ruleSetCount > 0
                          ? "bg-emerald-50 text-success border border-emerald-100"
                          : "bg-red-50 text-danger border border-red-100"
                    }`}>
                      {ruleSetCount} rules bounded
                    </span>
                  </div>
                </td>

                {/* Classification Origin */}
                <td className="py-4 px-6 align-middle">
                  {isSystem ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase bg-slate-900 text-white px-2 py-0.5 rounded-md border border-slate-950">
                      System Core
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase bg-background border border-slate-200 text-text-muted px-2 py-0.5 rounded-md">
                      Custom Tenant
                    </span>
                  )}
                </td>

                {/* Action Popups Menus */}
                <td className="py-4 px-6 text-right align-middle relative">
                  <div className="inline-block text-left">
                    <button 
                      disabled={isSystem}
                      onClick={() => setActiveDropdownId(activeDropdownId === role._id ? null : role._id)}
                      className="text-text-muted hover:text-text-main p-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      title={isSystem ? "System baseline records cannot be mutated directly" : "Modify custom group layout"}
                    >
                      <FiMoreVertical className="text-sm" />
                    </button>

                    {activeDropdownId === role._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden font-sans text-xs">
                          <button 
                            onClick={() => handleDeleteRole(role._id)}
                            className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 font-medium text-danger transition-colors"
                          >
                            <FiTrash2 />
                            <span>Purge Custom Role</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>

              </tr>
            );
          })
        }
      />

      {/* ----------------- POPUP MODAL DRAWER CREATE CAPABILITY ROLE ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden font-sans">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FiShield className="text-primary text-base" />
                <h3 className="text-sm font-bold text-heading">Forge Access Configuration Profile</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main p-1 rounded-md transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">Strategic Identity Label Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. general_editor, compliance_officer"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-background border border-slate-200 text-text-main p-2.5 rounded-lg focus:outline-none focus:border-primary font-medium lowercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-text-muted uppercase tracking-wider text-[10px]">
                  Map Directives Matrix Bound ({selectedPermissions.length} selected)
                </label>
                
                <div className="w-full border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-background divide-y divide-slate-100">
                  {permissionsPool.length === 0 ? (
                    <div className="p-4 text-center text-text-muted italic opacity-60">
                      Querying connected ecosystem directives ledger pool...
                    </div>
                  ) : (
                    permissionsPool.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm._id);
                      return (
                        <div 
                          key={perm._id}
                          onClick={() => togglePermissionSelection(perm._id)}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer select-none transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isChecked ? "bg-primary border-primary text-white" : "border-slate-300 bg-white"
                          }`}>
                            {isChecked && <FiCheck size={10} strokeWidth={4} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] font-bold text-text-main">{perm.name}</span>
                            {perm.module && (
                              <span className="text-[9px] text-text-muted opacity-80 uppercase tracking-tight">Module: {perm.module}</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
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
                  {isSubmitting ? "Mapping Framework Core..." : "Commit Role Assignment"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default RolesPage;