"use client";
import React, { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import {
  getCountries,
  getDistricts,
  getCounties,
  getSubcounties,
  getParishes,
  getVillages,
  addDistrict,
  addCountry,
  addBulkCountries,
  addBulkDistricts,
  addBulkCounties,
  addBulkSubcounties,
  addBulkParishes,
  addBulkVillages,
  updateDistrict,
  updateCountry,
  deleteDistrict,
  addCounty,
  updateCounty,
  deleteCounty,
  addSubcounty,
  updateSubcounty,
  deleteSubcounty,
  addParish,
  updateParish,
  deleteParish,
  addVillage,
  updateVillage,
  deleteVillage,
  deleteCountry,
  searchDistricts,
  searchCounties,
  searchSubcounties,
  searchParishes,
  searchVillages,
  searchCountries,
} from "@/lib/auth";

type Level =
  | "countries"
  | "districts"
  | "counties"
  | "subcounties"
  | "parishes"
  | "villages";

interface ExpandableNodeProps {
  title: string;
  loader?: (page?: number, size?: number) => Promise<any>;
  childrenKey?: string;
  level?: Level;
  parentId?: number;
  onOpenModal?: (state: any) => void;
  refresh?: () => void;
  setOperationLoading?: (v: boolean) => void;
}

const ExpandableNode = React.forwardRef<HTMLDivElement, ExpandableNodeProps>(
  (
    {
      title,
      loader,
      childrenKey = "items",
      level = "countries",
      parentId,
      onOpenModal,
      refresh,
      setOperationLoading,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [children, setChildren] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 10;

    const handleToggle = async () => {
      setOpen((v) => !v);
      if (!children && loader) {
        setLoading(true);
        try {
          const res = await loader(0, PAGE_SIZE);
          const items =
            res?.items ||
            res?.data ||
            res?.content ||
            res?.countries ||
            res?.districts ||
            res?.counties ||
            res?.subcounties ||
            res?.parishes ||
            res?.villages ||
            res ||
            [];
          setChildren(items);
          setHasMore(items.length === PAGE_SIZE);
          setPage(0);
        } catch (err) {
          setChildren([]);
        } finally {
          setLoading(false);
        }
      }
    };

    const loadMore = async () => {
      if (!loader || !children) return;
      try {
        const nextPage = page + 1;
        console.log('ExpandableNode loading page:', nextPage, 'childrenKey:', childrenKey);
        const res = await loader(nextPage, PAGE_SIZE);
        console.log('Response:', res);
        const items =
          res?.items ||
          res?.data ||
          res?.content ||
          res?.countries ||
          res?.districts ||
          res?.counties ||
          res?.subcounties ||
          res?.parishes ||
          res?.villages ||
          res ||
          [];
        console.log('Extracted items count:', items.length);
        
        // Filter out duplicates
        const existingIds = new Set(children.map(c => c.id));
        const newItems = items.filter(item => !existingIds.has(item.id));
        
        if (newItems.length === 0) {
          console.warn('No new items found for', childrenKey);
          setHasMore(false);
          return;
        }
        
        setChildren([...children, ...newItems]);
        setHasMore(newItems.length === PAGE_SIZE);
        setPage(nextPage);
      } catch (err) {
        console.error('Load more error:', err);
      }
    };

    return (
      <div className="pl-4" ref={ref}>
        <div className="flex items-center gap-2 py-1">
          {loader && (
            <button
              onClick={handleToggle}
              aria-expanded={open}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              title={open ? "Collapse" : "Expand"}
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  open ? "rotate-90" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 6a1 1 0 011.707-.707l5 5a1 1 0 010 1.414l-5 5A1 1 0 016 16.293L10.586 12 6 7.414A1 1 0 016 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <div
            onClick={loader ? handleToggle : undefined}
            className={`flex-1 text-sm font-medium ${
              loader ? "cursor-pointer hover:underline" : ""
            }`}
          >
            {title}
          </div>
          {loading && (
            <div className="flex items-center ml-2">
              <svg
                className="w-4 h-4 animate-spin text-gray-500"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {open && (
          <div className="pl-4">
            {loading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin text-gray-500"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <div className="text-sm text-gray-500">Loading...</div>
              </div>
            ) : children && children.length > 0 ? (
              children.map((c: any) => (
                <div
                  key={c.id}
                  className="py-1 flex items-center justify-between hover:bg-gray-50 rounded p-1"
                >
                  <div className="flex-1">
                    <ExpandableNode
                      title={
                        (c.flag ? `${c.flag} ` : "") + (c.name || c.title)
                      }
                      loader={(page = 0, size = 10) => {
                        if (childrenKey === "districts")
                          return getCounties(c.id, page, size);
                        if (childrenKey === "counties")
                          return getSubcounties(c.id, page, size);
                        if (childrenKey === "subcounties")
                          return getParishes(c.id, page, size);
                        if (childrenKey === "parishes")
                          return getVillages(c.id, page, size);
                        if (childrenKey === "villages")
                          return Promise.resolve([]);
                        return Promise.resolve([]);
                      }}
                      childrenKey={
                        childrenKey === "districts"
                          ? "counties"
                          : childrenKey === "counties"
                          ? "subcounties"
                          : childrenKey === "subcounties"
                          ? "parishes"
                          : childrenKey === "parishes"
                          ? "villages"
                          : "villages"
                      }
                      level={
                        childrenKey === "districts"
                          ? "counties"
                          : childrenKey === "counties"
                          ? "subcounties"
                          : childrenKey === "subcounties"
                          ? "parishes"
                          : childrenKey === "parishes"
                          ? "villages"
                          : "villages"
                      }
                      parentId={c.id}
                      onOpenModal={onOpenModal}
                      refresh={refresh}
                      setOperationLoading={setOperationLoading}
                    />
                  </div>
                  <div className="flex gap-2 ml-4">
                    {childrenKey === "districts" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: 'bulk', level: 'counties', parentId: c.id });
                          }}
                          className="text-xs text-gray-600"
                          title="Bulk import counties"
                        >
                          Bulk Counties
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: "add", level: "counties", parentId: c.id });
                          }}
                          className="text-xs text-blue-600"
                        >
                          +County
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: "edit", level: "districts", id: c.id, name: c.name || c.title });
                          }}
                          className="text-xs text-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Delete district?")) {
                              setOperationLoading?.(true);
                              try {
                                await deleteDistrict(c.id);
                                refresh?.();
                              } finally {
                                setOperationLoading?.(false);
                              }
                            }
                          }}
                          className="text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {childrenKey === "counties" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: "add", level: "subcounties", parentId: c.id });
                          }}
                          className="text-xs text-blue-600"
                        >
                          +Subcounty
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: 'bulk', level: 'subcounties', parentId: c.id });
                          }}
                          className="text-xs text-gray-600"
                          title="Bulk import subcounties"
                        >
                          Bulk Subcounties
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: "edit", level: "counties", id: c.id, name: c.name || c.title });
                          }}
                          className="text-xs text-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Delete county?")) {
                              setOperationLoading?.(true);
                              try {
                                await deleteCounty(c.id);
                                refresh?.();
                              } finally {
                                setOperationLoading?.(false);
                              }
                            }
                          }}
                          className="text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {childrenKey === "subcounties" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: "add", level: "parishes", parentId: c.id });
                          }}
                          className="text-xs text-blue-600"
                        >
                          +Parish
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: 'bulk', level: 'parishes', parentId: c.id });
                          }}
                          className="text-xs text-gray-600"
                          title="Bulk import parishes"
                        >
                          Bulk Parishes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: "edit", level: "subcounties", id: c.id, name: c.name || c.title });
                          }}
                          className="text-xs text-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Delete subcounty?")) {
                              setOperationLoading?.(true);
                              try {
                                await deleteSubcounty(c.id);
                                refresh?.();
                              } finally {
                                setOperationLoading?.(false);
                              }
                            }
                          }}
                          className="text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {childrenKey === "parishes" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: "add", level: "villages", parentId: c.id });
                          }}
                          className="text-xs text-blue-600"
                        >
                          +Village
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: 'bulk', level: 'villages', parentId: c.id });
                          }}
                          className="text-xs text-gray-600"
                          title="Bulk import villages"
                        >
                          Bulk Villages
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: "edit", level: "parishes", id: c.id, name: c.name || c.title });
                          }}
                          className="text-xs text-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Delete parish?")) {
                              setOperationLoading?.(true);
                              try {
                                await deleteParish(c.id);
                                refresh?.();
                              } finally {
                                setOperationLoading?.(false);
                              }
                            }
                          }}
                          className="text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {childrenKey === "villages" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal?.({ type: "edit", level: "villages", id: c.id, name: c.name || c.title });
                          }}
                          className="text-xs text-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Delete village?")) {
                              setOperationLoading?.(true);
                              try {
                                await deleteVillage(c.id);
                                refresh?.();
                              } finally {
                                setOperationLoading?.(false);
                              }
                            }
                          }}
                          className="text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No items</div>
            )}
            {hasMore && children && children.length > 0 && (
              <div className="flex justify-center mt-2 pl-4">
                <button
                  onClick={loadMore}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ExpandableNode.displayName = "ExpandableNode";

export default function LocationsPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [modalState, setModalState] = useState<any>({ type: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreCountries, setHasMoreCountries] = useState(true);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCountries(0, PAGE_SIZE);
        const items = data?.countries || data?.data || data || [];
        setCountries(items);
        setHasMoreCountries(items.length === PAGE_SIZE);
        setCurrentPage(0);
      } catch (err) {
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refreshCountries = async () => {
    setLoading(true);
    try {
      const data = await getCountries(0, PAGE_SIZE);
      const items = data?.countries || data?.data || data || [];
      setCountries(items);
      setHasMoreCountries(items.length === PAGE_SIZE);
      setCurrentPage(0);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCountries = async () => {
    try {
      const nextPage = currentPage + 1;
      console.log('Loading page:', nextPage, 'PAGE_SIZE:', PAGE_SIZE);
      const data = await getCountries(nextPage, PAGE_SIZE);
      console.log('Fetched data:', data);
      const items = data?.countries || data?.data || data || [];
      console.log('Extracted items count:', items.length);
      
      // Filter out duplicates
      const existingIds = new Set(countries.map(c => c.id));
      const newItems = items.filter(item => !existingIds.has(item.id));
      
      if (newItems.length === 0) {
        console.warn('No new items found, probably duplicate page data');
        setHasMoreCountries(false);
        return;
      }
      
      setCountries([...countries, ...newItems]);
      setHasMoreCountries(newItems.length === PAGE_SIZE);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Load more countries error:', err);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const [countriesRes, dRes, cRes, sRes, pRes, vRes] =
        await Promise.allSettled([
          searchCountries(q),
          searchDistricts(q),
          searchCounties(q),
          searchSubcounties(q),
          searchParishes(q),
          searchVillages(q),
        ]);
      const results: any[] = [];
      if (countriesRes.status === "fulfilled")
        results.push(
          ...(countriesRes.value?.countries ||
            countriesRes.value?.data ||
            countriesRes.value ||
            [])
        );
      if (dRes.status === "fulfilled")
        results.push(
          ...(dRes.value?.districts || dRes.value?.data || dRes.value || [])
        );
      if (cRes.status === "fulfilled")
        results.push(
          ...(cRes.value?.counties || cRes.value?.data || cRes.value || [])
        );
      if (sRes.status === "fulfilled")
        results.push(
          ...(sRes.value?.subcounties ||
            sRes.value?.data ||
            sRes.value ||
            [])
        );
      if (pRes.status === "fulfilled")
        results.push(
          ...(pRes.value?.parishes || pRes.value?.data || pRes.value || [])
        );
      if (vRes.status === "fulfilled")
        results.push(
          ...(vRes.value?.villages || vRes.value?.data || vRes.value || [])
        );
      setSearchResults(results);
    } catch (err) {
      console.error("Search error", err);
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Locations" />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex gap-2">
            <button
              onClick={() =>
                setModalState({ type: "add", level: "countries" })
              }
              className="text-sm bg-green-600 text-white px-3 py-1 rounded"
            >
              + Country
            </button>
            <button
              onClick={() => setModalState({ type: 'bulk', level: 'countries' })}
              className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded"
            >
              Bulk Import
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search locations (districts, counties, subcounties, parishes, villages)..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-sm mb-4"
        />

        {searchResults && (
          <div className="mb-4 p-2 border rounded bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Search Results</h4>
            {searchResults.length === 0 ? (
              <div className="text-sm text-gray-500">No results</div>
            ) : (
              <ul className="space-y-1 text-sm">
                {searchResults.map((r: any) => (
                  <li
                    key={r.id}
                    className="flex justify-between items-center"
                  >
                    <div>{r.name || r.title}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setModalState({
                            type: "edit",
                            id: r.id,
                            name: r.name || r.title,
                          })
                        }
                        className="text-xs text-yellow-600"
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

            <div className="p-4 border rounded-lg">
              {countries.map((c) => (
                <div key={c.id} className="mb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{c.name || c.title}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setModalState({ type: "add", level: "districts", parentId: c.id })
                        }
                        className="text-xs text-blue-600"
                      >
                        + District
                      </button>
                      <button
                        onClick={() =>
                          setModalState({ type: "edit", level: "countries", id: c.id, name: c.name || c.title })
                        }
                        className="text-xs text-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("Delete country?")) {
                            setOperationLoading(true);
                            try {
                              await deleteCountry(c.id);
                              await refreshCountries();
                            } finally {
                              setOperationLoading(false);
                            }
                          }
                        }}
                        className="text-xs text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <ExpandableNode
                    title=""
                    loader={(page = 0, size = PAGE_SIZE) => getDistricts(c.id, page, size)}
                    childrenKey="districts"
                    level="districts"
                    parentId={c.id}
                    onOpenModal={setModalState}
                    refresh={refreshCountries}
                    setOperationLoading={setOperationLoading}
                  />
                </div>
              ))}
              {hasMoreCountries && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={loadMoreCountries}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Load More Countries
                  </button>
                </div>
              )}
            </div>

        <LocationModal
          state={modalState}
          onClose={() => setModalState({ type: null })}
          onSave={async (d: any) => {
            setOperationLoading(true);
            try {
              if (modalState.type === "add") {
                const lvl = modalState.level as Level;
                const parent = modalState.parentId;
                if (lvl === "countries")
                  await addCountry(d.name, d.flag);
                if (lvl === "districts")
                  await addDistrict(d.name, parent);
                if (lvl === "counties") await addCounty(d.name, parent);
                if (lvl === "subcounties")
                  await addSubcounty(d.name, parent);
                if (lvl === "parishes")
                  await addParish(d.name, parent);
                if (lvl === "villages")
                  await addVillage(d.name, parent);
              }
              if (modalState.type === "edit") {
                const id = modalState.id;
                const lvl = modalState.level as Level | undefined;
                if (lvl === "countries")
                  await updateCountry(id, d.name);
                if (lvl === "districts" || !lvl)
                  await updateDistrict(id, d.name);
                if (lvl === "counties")
                  await updateCounty(id, d.name);
                if (lvl === "subcounties")
                  await updateSubcounty(id, d.name);
                if (lvl === "parishes")
                  await updateParish(id, d.name);
                if (lvl === "villages")
                  await updateVillage(id, d.name);
              }
            } catch (err) {
              alert("Operation failed");
            } finally {
              setOperationLoading(false);
              setModalState({ type: null });
              await refreshCountries();
            }
          }}
          loading={operationLoading}
        />
        <BulkLocationModal
          state={modalState}
          countries={countries}
          onClose={() => setModalState({ type: null })}
          onImport={async (payload: any) => {
            setOperationLoading(true);
            try {
              const lvl = (payload.level as Level) || (modalState.level as Level);
              const file: File = payload.file;
              const parentId = payload.parentId;
              if (lvl === 'countries') await addBulkCountries(file);
              if (lvl === 'districts') await addBulkDistricts(file, Number(parentId));
              if (lvl === 'counties') await addBulkCounties(file, Number(parentId));
              if (lvl === 'subcounties') await addBulkSubcounties(file, Number(parentId));
              if (lvl === 'parishes') await addBulkParishes(file, Number(parentId));
              if (lvl === 'villages') await addBulkVillages(file, Number(parentId));
            } catch (err) {
              alert('Bulk import failed');
            } finally {
              setOperationLoading(false);
              setModalState({ type: null });
              await refreshCountries();
            }
          }}
          loading={operationLoading}
        />
      </div>
    </div>
  );
}

interface LocationModalProps {
  state: any;
  onClose: () => void;
  onSave: (data: any) => void;
  loading?: boolean;
}

const LocationModal: React.FC<LocationModalProps> = ({
  state,
  onClose,
  onSave,
  loading = false,
}) => {
  const [name, setName] = useState(state?.name || "");
  const [flag, setFlag] = useState(state?.flag || "");

  useEffect(() => {
    setName(state?.name || "");
    setFlag(state?.flag || "");
  }, [state?.type, state?.id]);

  if (!state?.type) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-80">
        <h3 className="font-semibold mb-2">
          {state.type === "add" ? `Add ${state.level}` : "Edit"}
        </h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-2 py-1 mb-3"
        />
        <input
          value={flag}
          placeholder="Flag (emoji or code)"
          onChange={(e) => setFlag(e.target.value)}
          className="w-full border rounded px-2 py-1 mb-3"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, flag })}
            disabled={loading}
            className="flex-1 px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface BulkLocationModalProps {
  state: any;
  countries: any[];
  onClose: () => void;
  onImport: (data: { file: File; parentId?: number | string; level?: Level }) => void | Promise<void>;
  loading?: boolean;
}

const BulkLocationModal: React.FC<BulkLocationModalProps> = ({ state, countries, onClose, onImport, loading = false }) => {
  const [level, setLevel] = useState<Level>(state?.level || 'countries');
  const [parentId, setParentId] = useState<string | number | undefined>(state?.parentId);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [filePreview, setFilePreview] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setLevel(state?.level || 'countries');
    setParentId(state?.parentId);
    setFile(null);
    setFileName('');
    setFilePreview('');
    setError('');
  }, [state?.type, state?.level, state?.parentId]);

  if (state?.type !== 'bulk') return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setError('');
      if (!selectedFile.name.endsWith('.json')) {
        setError('Please select a valid JSON file');
        setFile(null);
        setFileName('');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          JSON.parse(content);
          
          setFile(selectedFile);
          setFileName(selectedFile.name);
          setFilePreview(`${selectedFile.name} ready`);
        } catch (err) {
          setError('Invalid JSON format');
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (level === 'districts' && !parentId) {
      setError('Country selection is required for districts');
      return;
    }

    await onImport({ file, parentId, level });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96">
        <h3 className="font-semibold mb-4">Bulk Import Locations</h3>

        <label className="text-xs text-gray-600 block mb-2">Level</label>
        <select value={level} onChange={(e) => {
          setLevel(e.target.value as Level);
          setParentId(undefined);
          setError('');
        }} className="w-full border rounded px-2 py-2 mb-4">
          <option value="countries">Countries</option>
          <option value="districts">Districts</option>
          <option value="counties">Counties</option>
          <option value="subcounties">Subcounties</option>
          <option value="parishes">Parishes</option>
          <option value="villages">Villages</option>
        </select>

        {level === 'districts' && (
          <>
            <label className="text-xs text-gray-600 block mb-2">Select Country</label>
            <select value={parentId as any || ''} onChange={(e) => setParentId(e.target.value)} className="w-full border rounded px-2 py-2 mb-4">
              <option value="">-- Select a country --</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </>
        )}

        {level !== 'countries' && level !== 'districts' && (
          <>
            <label className="text-xs text-gray-600 block mb-2">Parent ID</label>
            <input value={parentId as any || ''} onChange={(e) => setParentId(e.target.value)} placeholder="Enter parent ID" className="w-full border rounded px-2 py-2 mb-4" />
          </>
        )}

        <label className="text-xs text-gray-600 block mb-2">JSON File</label>
        <div className="relative mb-4">
          <input type="file" accept=".json" onChange={handleFileChange} className="w-full border rounded px-2 py-2" />
          {fileName && <p className="text-xs text-gray-500 mt-1">Selected: {fileName}</p>}
          {filePreview && <p className="text-xs text-green-600 mt-1">{filePreview}</p>}
        </div>

        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

        <p className="text-xs text-gray-500 mb-4">
          Upload a JSON file with format: <code className="text-xs bg-gray-100 px-1">[{"{\"name\": \"Item1\"}"}, {"{\"name\": \"Item2\"}"}]</code>
        </p>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-3 py-2 border rounded text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleImport} disabled={!file || !!error || loading} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Importing...' : 'Import'}</button>
        </div>
      </div>
    </div>
  );
};
