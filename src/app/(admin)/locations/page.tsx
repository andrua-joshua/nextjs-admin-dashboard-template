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

type Node = { id: number; name: string };

type Level = 'countries' | 'districts' | 'counties' | 'subcounties' | 'parishes' | 'villages';

const ExpandableNode: React.FC<{
  title: string;
  loader?: () => Promise<any>;
  childrenKey?: string;
  level?: Level;
  parentId?: number;
  onOpenModal?: (state: any) => void;
  refresh?: () => void;
}> = ({ title, loader, childrenKey = 'items', level = 'countries', parentId, onOpenModal, refresh }) => {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setOpen(!open);
    if (!children && loader) {
      setLoading(true);
      try {
        const res = await loader();
        const items = res?.items || res?.data || res?.content || res?.countries || res?.districts || res?.counties || res?.parishes || res || [];
        setChildren(items);
      } catch (err) {
        setChildren([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="pl-4">
      <div className="flex items-center gap-2 py-1">
        {loader && (
          <button onClick={handleToggle} className="text-sm text-gray-500">{open ? '-' : '+'}</button>
        )}
        <div className="text-sm font-medium">{title}</div>
      </div>
      {open && (
        <div className="pl-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            children && children.length > 0 ? (
              children.map((c: any) => (
                <div key={c.id} className="py-1 flex items-center justify-between">
                  <div className="flex-1">
                    <ExpandableNode
                      title={c.name || c.title}
                      loader={() => {
                        if (childrenKey === 'countries') return getDistricts(c.id);
                        if (childrenKey === 'districts') return getCounties(c.id);
                        if (childrenKey === 'counties') return getSubcounties(c.id);
                        if (childrenKey === 'subcounties') return getParishes(c.id);
                        if (childrenKey === 'parishes') return getVillages(c.id);
                        return Promise.resolve([]);
                      }}
                      childrenKey={
                        childrenKey === 'countries'
                          ? 'districts'
                          : childrenKey === 'districts'
                          ? 'counties'
                          : childrenKey === 'counties'
                          ? 'subcounties'
                          : childrenKey === 'subcounties'
                          ? 'parishes'
                          : 'villages'
                      }
                      level={
                        childrenKey === 'countries'
                          ? 'districts'
                          : childrenKey === 'districts'
                          ? 'counties'
                          : childrenKey === 'counties'
                          ? 'subcounties'
                          : childrenKey === 'subcounties'
                          ? 'parishes'
                          : 'villages'
                      }
                      parentId={c.id}
                      onOpenModal={onOpenModal}
                      refresh={refresh}
                    />
                  </div>
                  <div className="flex gap-2 ml-4">
                    {/* Actions: Add child, Edit, Delete depending on level */}
                    {childrenKey === 'countries' && (
                      <button onClick={() => onOpenModal?.({ type: 'add', level: 'districts', parentId: c.id })} className="text-xs text-blue-600">+District</button>
                    )}
                    {childrenKey === 'districts' && (
                      <>
                        <button onClick={() => onOpenModal?.({ type: 'add', level: 'counties', parentId: c.id })} className="text-xs text-blue-600">+County</button>
                        <button onClick={() => onOpenModal?.({ type: 'edit', level: 'districts', id: c.id, name: c.name || c.title })} className="text-xs text-yellow-600">Edit</button>
                        <button onClick={async () => { if (confirm('Delete district?')) { await deleteDistrict(c.id); refresh?.(); } }} className="text-xs text-red-600">Delete</button>
                      </>
                    )}
                    {childrenKey === 'counties' && (
                      <>
                        <button onClick={() => onOpenModal?.({ type: 'add', level: 'subcounties', parentId: c.id })} className="text-xs text-blue-600">+Subcounty</button>
                        <button onClick={() => onOpenModal?.({ type: 'edit', level: 'counties', id: c.id, name: c.name || c.title })} className="text-xs text-yellow-600">Edit</button>
                        <button onClick={async () => { if (confirm('Delete county?')) { await deleteCounty(c.id); refresh?.(); } }} className="text-xs text-red-600">Delete</button>
                      </>
                    )}
                    {childrenKey === 'subcounties' && (
                      <>
                        <button onClick={() => onOpenModal?.({ type: 'add', level: 'parishes', parentId: c.id })} className="text-xs text-blue-600">+Parish</button>
                        <button onClick={() => onOpenModal?.({ type: 'edit', level: 'subcounties', id: c.id, name: c.name || c.title })} className="text-xs text-yellow-600">Edit</button>
                        <button onClick={async () => { if (confirm('Delete subcounty?')) { await deleteSubcounty(c.id); refresh?.(); } }} className="text-xs text-red-600">Delete</button>
                      </>
                    )}
                    {childrenKey === 'parishes' && (
                      <>
                        <button onClick={() => onOpenModal?.({ type: 'add', level: 'villages', parentId: c.id })} className="text-xs text-blue-600">+Village</button>
                        <button onClick={() => onOpenModal?.({ type: 'edit', level: 'parishes', id: c.id, name: c.name || c.title })} className="text-xs text-yellow-600">Edit</button>
                        <button onClick={async () => { if (confirm('Delete parish?')) { await deleteParish(c.id); refresh?.(); } }} className="text-xs text-red-600">Delete</button>
                      </>
                    )}
                    {childrenKey === 'villages' && (
                      <>
                        <button onClick={() => onOpenModal?.({ type: 'edit', level: 'villages', id: c.id, name: c.name || c.title })} className="text-xs text-yellow-600">Edit</button>
                        <button onClick={async () => { if (confirm('Delete village?')) { await deleteVillage(c.id); refresh?.(); } }} className="text-xs text-red-600">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No data</div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default function LocationsPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<any>({ type: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCountries();
        const items = data?.countries || data?.data || data || [];
        setCountries(items);
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
      const data = await getCountries();
      const items = data?.countries || data?.data || data || [];
      setCountries(items);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    // search across levels in parallel
    try {
      const [countriesRes, dRes, cRes, sRes, pRes, vRes] = await Promise.allSettled([
        searchCountries(q),
        searchDistricts(q),
        searchCounties(q),
        searchSubcounties(q),
        searchParishes(q),
        searchVillages(q),
      ]);
      const results: any[] = [];
      if (countriesRes.status === 'fulfilled') results.push(...(countriesRes.value?.countries || countriesRes.value?.data || countriesRes.value || []));
      if (dRes.status === 'fulfilled') results.push(...(dRes.value?.districts || dRes.value?.data || dRes.value || []));
      if (cRes.status === 'fulfilled') results.push(...(cRes.value?.counties || cRes.value?.data || cRes.value || []));
      if (sRes.status === 'fulfilled') results.push(...(sRes.value?.subcounties || sRes.value?.data || sRes.value || []));
      if (pRes.status === 'fulfilled') results.push(...(pRes.value?.parishes || pRes.value?.data || pRes.value || []));
      if (vRes.status === 'fulfilled') results.push(...(vRes.value?.villages || vRes.value?.data || vRes.value || []));
      setSearchResults(results);
    } catch (err) {
      console.error('Search error', err);
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Locations" />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div />
          <button onClick={() => setModalState({ type: 'add', level: 'countries' })} className="text-sm bg-green-600 text-white px-3 py-1 rounded">+ Country</button>
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
                  <li key={r.id} className="flex justify-between items-center">
                    <div>{r.name || r.title}</div>
                    <div className="flex gap-2">
                      <button onClick={() => setModalState({ type: 'edit', id: r.id, name: r.name || r.title })} className="text-xs text-yellow-600">Edit</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      {loading ? (
        <div className="p-8">Loading...</div>
      ) : (
        <div className="p-4 border rounded-lg">
          {countries.map((c) => (
            <div key={c.id} className="mb-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{c.name || c.title}</div>
                <div className="flex gap-2">
                  <button onClick={() => setModalState({ type: 'add', level: 'districts', parentId: c.id })} className="text-xs text-blue-600">+ District</button>
                  <button onClick={() => setModalState({ type: 'edit', level: 'countries', id: c.id, name: c.name || c.title })} className="text-xs text-yellow-600">Edit</button>
                  <button onClick={async () => { if (confirm('Delete country?')) { await deleteCountry(c.id); await refreshCountries(); } }} className="text-xs text-red-600">Delete</button>
                </div>
              </div>
              <ExpandableNode title="" loader={() => getDistricts(c.id)} childrenKey="countries" level="districts" parentId={c.id} onOpenModal={setModalState} refresh={refreshCountries} />
            </div>
          ))}
        </div>
      )}
      <LocationModal state={modalState} onClose={() => setModalState({ type: null })} onSave={async (d: any) => {
        try {
          if (modalState.type === 'add') {
            const lvl = modalState.level as Level;
            const parent = modalState.parentId;
            if (lvl === 'countries') await addCountry(d.name);
            if (lvl === 'districts') await addDistrict(d.name, parent);
            if (lvl === 'counties') await addCounty(d.name, parent);
            if (lvl === 'subcounties') await addSubcounty(d.name, parent);
            if (lvl === 'parishes') await addParish(d.name, parent);
            if (lvl === 'villages') await addVillage(d.name, parent);
          }
          if (modalState.type === 'edit') {
            const id = modalState.id;
            const lvl = modalState.level as Level | undefined;
            // If level not provided, try updating across all (best-effort)
            if (lvl === 'countries') await updateCountry(id, d.name);
            if (lvl === 'districts' || !lvl) await updateDistrict(id, d.name);
            if (lvl === 'counties') await updateCounty(id, d.name);
            if (lvl === 'subcounties') await updateSubcounty(id, d.name);
            if (lvl === 'parishes') await updateParish(id, d.name);
            if (lvl === 'villages') await updateVillage(id, d.name);
          }
        } catch (err) {
          alert('Operation failed');
        } finally {
          setModalState({ type: null });
          await refreshCountries();
        }
      }} />
    </div>
  </div>
  );
}

const LocationModal: React.FC<{ state: any; onClose: () => void; onSave: (data: any) => void }> = ({ state, onClose, onSave }) => {
  const [name, setName] = useState(state?.name || '');
  useEffect(() => {
    setName(state?.name || '');
  }, [state?.type, state?.id]);
  if (!state?.type) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-80">
        <h3 className="font-semibold mb-2">{state.type === 'add' ? `Add ${state.level}` : 'Edit'}</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-2 py-1 mb-3" />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-3 py-1 border rounded">Cancel</button>
          <button onClick={() => onSave({ name })} className="flex-1 px-3 py-1 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};
