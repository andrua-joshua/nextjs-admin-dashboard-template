"use client";
import React, { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { getAllCategories, addCategory, updateCategory, deleteCategory } from "@/lib/auth";

type RawCategory = {
  id: number;
  title: string;
  description?: string | null;
  icon?: string | null;
  childTo?: any;
};

type Category = RawCategory & { children?: Category[]; parentId?: number | null };

type ModalState = {
  type: 'add-root' | 'add-child' | 'edit' | 'import' | null;
  parentId?: number;
  categoryId?: number;
  title?: string;
  description?: string;
  icon?: string;
};

// Modal Component
const CategoryModal: React.FC<{
  state: ModalState;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading?: boolean;
}> = ({ state, onClose, onSave, isLoading = false }) => {
  const [title, setTitle] = useState(state.title || '');
  const [description, setDescription] = useState(state.description || '');
  const [iconUrl, setIconUrl] = useState(state.icon || '');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(state.icon || null);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Update form when modal state changes
  useEffect(() => {
    setTitle(state.title || '');
    setDescription(state.description || '');
    setIconUrl(state.icon || '');
    setIconFile(null);
    setIconPreview(state.icon || null);
    setImportFile(null);
  }, [state.type, state.categoryId]);

  if (!state.type) return null;

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setIconPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (state.type === 'import') {
      onSave({ file: importFile });
    } else {
      onSave({
        title,
        description,
        icon: iconFile || iconUrl,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {state.type === 'add-root' && 'Add Root Category'}
          {state.type === 'add-child' && 'Add Child Category'}
          {state.type === 'edit' && 'Edit Category'}
          {state.type === 'import' && 'Import Categories'}
        </h2>

        {state.type === 'import' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">JSON File</label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <p className="text-xs text-gray-500">
              Format: Array of objects with title, description, icon (optional), childTo (optional)
            </p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
{`[
  {
    "title": "Electronics",
    "description": "...",
    "icon": "/icons/electronics.png",
    "childTo": -1
  },
  {
    "title": "Phones",
    "description": "...",
    "icon": "/icons/phones.png",
    "childTo": 1
  }
]`}
            </pre>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-2 py-1"
                placeholder="Category title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-2 py-1"
                placeholder="Category description"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleIconFileChange}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            {iconPreview && (
              <div className="flex justify-center">
                <img src={iconPreview} alt="Preview" className="w-16 h-16 object-cover rounded border" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Or Icon URL</label>
              <input
                type="text"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                className="w-full border rounded px-2 py-1"
                placeholder="/path/to/icon.png"
                disabled={!!iconFile}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            disabled={isLoading || (state.type === 'import' && !importFile) || (state.type !== 'import' && !title)}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

function buildTree(items: RawCategory[]) {
  const map = new Map<number, Category>();
  const roots: Category[] = [];
  
  // normalize and compute parentId from childTo (null or -1 => root)
  items.forEach((it) => {
    let parentId: number | null = null;
    if (it.childTo !== null && it.childTo !== undefined && it.childTo !== -1) {
      if (typeof it.childTo === 'object' && it.childTo.id !== undefined) {
        parentId = Number(it.childTo.id);
      } else if (typeof it.childTo === 'number') {
        parentId = Number(it.childTo);
      }
    }
    // Ensure childTo is not included in the normalized category (only keep primitive props)
    const normalizedCategory: Category = {
      id: it.id,
      title: it.title,
      description: it.description,
      icon: it.icon,
      parentId,
      children: [],
    };
    map.set(it.id, normalizedCategory);
  });

  map.forEach((node) => {
    if (node.parentId != null && map.has(node.parentId)) {
      map.get(node.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  
  // Sort roots by id for consistent display
  roots.sort((a, b) => (a.id || 0) - (b.id || 0));
  return roots;
}

const CategoryNode: React.FC<{ 
  node: Category; 
  refresh: () => void;
  onOpenModal: (state: ModalState) => void;
}> = ({ node, refresh, onOpenModal }) => {
  const [open, setOpen] = useState(false);

  const imgSrc = node.icon
    ? node.icon.startsWith('http')
      ? node.icon
      : `/${String(node.icon).replace(/^\/+/, '')}`
    : null;

  const handleAddChild = () => {
    onOpenModal({ type: 'add-child', parentId: node.id });
  };

  const handleEdit = () => {
    onOpenModal({
      type: 'edit',
      categoryId: node.id,
      title: node.title,
      description: node.description || '',
      icon: node.icon || '',
    });
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${node.title}"?`)) return;
    try {
      await deleteCategory(node.id);
      refresh();
    } catch (e) {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="border-l pl-4 py-1">
      <div className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded px-2">
        <div className="flex items-center gap-2 flex-1">
          {node.children && node.children.length > 0 && (
            <button
              onClick={() => setOpen(!open)}
              className="text-sm font-bold text-gray-600 w-5 text-center hover:bg-gray-200 rounded"
            >
              {open ? '▼' : '▶'}
            </button>
          )}
          {node.children && node.children.length === 0 && <div className="w-5" />}
          {imgSrc && (
            <img src={imgSrc} alt={node.title} className="w-6 h-6 object-cover rounded" />
          )}
          <div>
            <div className="text-sm font-medium">{node.title}</div>
            {node.description && <div className="text-xs text-gray-500">{node.description}</div>}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleAddChild}
            className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            + Child
          </button>
          <button
            onClick={handleEdit}
            className="text-xs px-2 py-1 text-yellow-600 hover:bg-yellow-50 rounded"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      {open && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((c) => (
            <CategoryNode key={c.id} node={c} refresh={refresh} onOpenModal={onOpenModal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCategories(0, 1000);
      // assume response has `categories` or `data` or `content`
      const items: RawCategory[] = data?.categories || data?.content || data?.data || [];
      console.log('Loaded categories:', items);
      const tree = buildTree(items);
      console.log('Built tree:', tree);
      setCategories(tree);
      setAllCategories(tree);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Error loading categories:', msg);
      setError(msg);
      setCategories([]);
      setAllCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleModalSave = async (data: any) => {
    try {
      setIsSaving(true);

      // Pass File objects or string URLs directly - API helper will handle FormData
      const iconValue = data.icon || null;

      if (modalState.type === 'add-root') {
        // Don't include childTo for root categories
        await addCategory({
          title: data.title,
          description: data.description || null,
          icon: iconValue,
        });
      } else if (modalState.type === 'add-child') {
        await addCategory({
          title: data.title,
          description: data.description || null,
          icon: iconValue,
          childTo: modalState.parentId || -1,
        });
      } else if (modalState.type === 'edit') {
        await updateCategory(modalState.categoryId!, {
          title: data.title,
          description: data.description || null,
          icon: iconValue,
        });
      } else if (modalState.type === 'import') {
        await handleBulkImport(data.file);
      }

      setModalState({ type: null });
      await loadCategories();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkImport = async (file: File) => {
    const text = await file.text();
    let categories: any[] = [];

    try {
      // Try parsing as JSON
      const json = JSON.parse(text);
      categories = Array.isArray(json) ? json : [json];
    } catch (err) {
      throw new Error('Invalid JSON format. Expected an array of category objects.');
    }

    if (categories.length === 0) {
      throw new Error('No valid categories in file');
    }

    // Import each category
    let successCount = 0;
    let failureCount = 0;

    for (const cat of categories) {
      try {
        const payload: any = {
          title: cat.title,
          description: cat.description || null,
          childTo: cat.childTo ?? -1,
        };

        // Handle icon if present
        if (cat.icon) {
          payload.icon = cat.icon;
        }

        await addCategory(payload);
        successCount++;
      } catch (err) {
        console.error('Failed to import category:', cat.title, err);
        failureCount++;
      }
    }

    alert(`Imported ${successCount} categories${failureCount > 0 ? `, ${failureCount} failed` : ''}`);
  };

  const filterCategories = (items: Category[], query: string): Category[] => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items
      .map((cat) => ({
        ...cat,
        children: cat.children ? filterCategories(cat.children, query) : [],
      }))
      .filter((cat) => cat.title.toLowerCase().includes(q) || cat.description?.toLowerCase().includes(q) || (cat.children && cat.children.length > 0));
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Categories" />

      <div className="flex gap-4">
        <button
          onClick={() => setModalState({ type: 'add-root' })}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          + Add Category
        </button>
        <button
          onClick={() => setModalState({ type: 'import' })}
          className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
        >
          📥 Import JSON
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search categories by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-sm"
        />
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading categories...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      ) : categories.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No categories found. Create one to get started.</div>
      ) : (
        <div className="border rounded-lg bg-white">
          {filterCategories(categories, searchQuery).map((c) => (
            <CategoryNode
              key={c.id}
              node={c}
              refresh={loadCategories}
              onOpenModal={setModalState}
            />
          ))}
        </div>
      )}

      <CategoryModal
        state={modalState}
        onClose={() => setModalState({ type: null })}
        onSave={handleModalSave}
        isLoading={isSaving}
      />
    </div>
  );
}
