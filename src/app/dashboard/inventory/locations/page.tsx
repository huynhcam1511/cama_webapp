"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Layers, Plus, MapPin, ChevronRight, ChevronDown, Package, Box, Search, Trash2, Shirt, Pencil, PackagePlus, QrCode, Table, Download, Loader2, ChevronLeft, Info, Printer, Calendar as CalendarIcon, X } from 'lucide-react';
import QRCode from 'qrcode';
import { getCustomLocations, addLocation, deleteLocation, saveLocationOrder, getLocationOrder, updateLocationNotes, renameLocation, getProductsByLocation, searchProducts } from './actions';

const smartLocationSort = (aName: string, bName: string) => {
  // Always pin Kho Ảo to the top
  if (aName === 'Kho Ảo') return -1;
  if (bName === 'Kho Ảo') return 1;

  const getFloorWeight = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('hầm')) return -1;
    if (lower.includes('trệt')) return 0;
    if (lower.includes('lửng')) return 0.5;
    if (lower.includes('thượng')) return 100;
    return null;
  };

  const wA = getFloorWeight(aName);
  const wB = getFloorWeight(bName);

  if (wA !== null && wB !== null) {
    if (wA !== wB) return wA - wB;
  } else if (wA !== null) {
    if (wA === 100) return 1;
    return -1;
  } else if (wB !== null) {
    if (wB === 100) return -1;
    return 1;
  }

  // Natural alphanumeric sort (e.g. Sào 1, Sào 2, Sào 10)
  return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
};

const ImageWithFallback = ({ src, alt, className, fallbackIcon: FallbackIcon = Shirt }: any) => {
  const [error, setError] = React.useState(false);
  const isValidSrc = src && typeof src === 'string' && !src.includes('undefined') && !src.includes('null');
  if (!isValidSrc || error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <FallbackIcon className="h-10 w-10 text-slate-300" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

const ProductCard = ({ p, onClick }: { p: any, onClick?: () => void }) => (
  <div onClick={onClick} className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-indigo-300 cursor-pointer group">
    <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden">
      <ImageWithFallback src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      {p.status === 'RENTED' && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase rounded-md shadow-sm">
          Đang thuê
        </div>
      )}
    </div>
    <div className="p-4 flex-1 flex flex-col gap-1.5">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">{p.name}</h4>
      </div>
      <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-500">
        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200 font-mono text-[10px]">{p.qr_code}</span>
        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200 text-[10px]">{p.group_type || 'Khác'}</span>
      </div>
      <div className="mt-auto pt-3 grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-500">
        <div>Size: <span className="font-bold text-slate-700">{p.size || '—'}</span></div>
        <div className="text-right">Số lượng: <span className="font-bold text-slate-700">1</span></div>
        <div className="col-span-2 text-slate-400 truncate mt-1">SKU: {p.sku || '—'}</div>
      </div>
    </div>
  </div>
);

export default function LocationExplorerPage() {
    const [customOrder, setCustomOrder] = useState<Record<string, string[]>>({});

  const [isLoaded, setIsLoaded] = useState(false);
  const [customLocations, setCustomLocations] = useState<{floor: string, shelf: string, tier: string, notes?: string}[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (!globalSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchProducts(globalSearch.trim());
      if (res.success) setSearchResults(res.products || []);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [globalSearch]);

  // Generate QR images with text below when in table view
  useEffect(() => {
    if (viewMode === 'table') {
      customLocations.forEach(async (loc) => {
        const codeParts = [loc.floor, loc.shelf, loc.tier].filter(Boolean);
        const locCode = codeParts.map(s => s.trim().toUpperCase().replace(/\s+/g, '-')).join('-');
        
        if (qrImages[locCode]) return; // Already generated

        const url = new URL(window.location.origin + '/dashboard/inventory/catalog/new');
        url.searchParams.set("floor", loc.floor);
        if (loc.shelf) url.searchParams.set("shelf", loc.shelf);
        if (loc.tier) url.searchParams.set("tier", loc.tier);
        
        try {
          // Nâng cấp: Tăng độ phân giải (width: 500), dùng mức sửa lỗi cao nhất (H), và màu đen tuyền tuyệt đối
          const qrDataUrl = await QRCode.toDataURL(url.toString(), { 
            margin: 2, 
            width: 500, 
            errorCorrectionLevel: 'H', 
            color: { dark: '#000000', light: '#ffffff' } 
          });
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const paddingBottom = 75; // Tăng khoảng trống bên dưới để cân xứng
            canvas.width = img.width;
            canvas.height = img.height + paddingBottom;
            
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            ctx.fillStyle = "#000000";
            ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"; // Phóng to chữ
            ctx.textAlign = "center";
            ctx.fillText(locCode, canvas.width / 2, canvas.height - 25);
            
            setQrImages(prev => ({ ...prev, [locCode]: canvas.toDataURL("image/png") }));
          };
          img.src = qrDataUrl;
        } catch (e) {
          console.error("Failed to generate QR for", locCode, e);
        }
      });
    }
  }, [viewMode, customLocations, qrImages]);

  // Load from Database
  useEffect(() => {
    async function loadData() {
      const [{ order }, { locations }] = await Promise.all([
        getLocationOrder(),
        getCustomLocations()
      ]);
      if (order) setCustomOrder(order);
      if (locations) setCustomLocations(locations);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  // Save order to Database
  useEffect(() => {
    if (isLoaded) {
      saveLocationOrder(customOrder);
    }
  }, [customOrder, isLoaded]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    const items = Array.from(currentChildren);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destIndex, 0, reorderedItem);

    const newOrder = items.map((item: any) => item.name);
    setCustomOrder(prev => ({
      ...prev,
      [selectedPath]: newOrder
    }));
  };
  const [selectedPath, setSelectedPath] = useState<string>("");

  useEffect(() => {
    async function loadProducts() {
      if (!selectedPath) {
        setProducts([]);
        return;
      }
      setIsLoadingProducts(true);
      const parts = selectedPath.split('|');
      const floor = parts[0];
      const shelf = parts[1] || "";
      const tier = parts[2] || "";
      const res = await getProductsByLocation(floor, shelf, tier);
      if (res.success) {
        setProducts(res.products || []);
      }
      setIsLoadingProducts(false);
    }
    loadProducts();

    // Auto-expand tree sidebar
    if (selectedPath) {
       const parts = selectedPath.split('|');
       setExpandedPaths(prev => {
         const newSet = new Set(prev);
         let currentPath = parts[0];
         newSet.add(currentPath);
         for(let i = 1; i < parts.length - 1; i++) {
            currentPath += '|' + parts[i];
            newSet.add(currentPath);
         }
         return newSet;
       });
    }
  }, [selectedPath]);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isMobileTreeOpen, setIsMobileTreeOpen] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocNotes, setNewLocNotes] = useState("");

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editLocName, setEditLocName] = useState("");
  const [editLocNotes, setEditLocNotes] = useState("");

  const addTargetLevel = selectedPath === "" ? "floor" : selectedPath.split('|').length === 1 ? "shelf" : "tier";

  // Build Tree
  const tree = useMemo(() => {
    const root: any = {};
    customLocations.forEach(loc => {
      if (!loc.floor) return;
      if (!root[loc.floor]) root[loc.floor] = { name: loc.floor, children: {}, notes: "" };

      if (loc.shelf) {
        if (!root[loc.floor].children[loc.shelf]) root[loc.floor].children[loc.shelf] = { name: loc.shelf, children: {}, notes: "" };

        if (loc.tier) {
          if (!root[loc.floor].children[loc.shelf].children[loc.tier]) {
            root[loc.floor].children[loc.shelf].children[loc.tier] = { name: loc.tier, children: {}, notes: "" };
          }
          root[loc.floor].children[loc.shelf].children[loc.tier].notes = loc.notes || "";
        } else {
          root[loc.floor].children[loc.shelf].notes = loc.notes || "";
        }
      } else {
        root[loc.floor].notes = loc.notes || "";
      }
    });
    return root;
  }, [customLocations]);

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const handleAddNewLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    const parts = selectedPath ? selectedPath.split('|') : [];
    const floor = parts[0] || (addTargetLevel === 'floor' ? newLocName : "");
    const shelf = parts[1] || (addTargetLevel === 'shelf' ? newLocName : "");
    const tier = parts[2] || (addTargetLevel === 'tier' ? newLocName : "");

    // Add to DB
    const res = await addLocation(floor, shelf, tier, newLocNotes);
    if (!res.success) {
      alert("Lỗi khi thêm vị trí: " + res.error);
      return;
    }

    // Add to list
    setCustomLocations(prev => {
      const exists = prev.some(l => l.floor === floor && l.shelf === shelf && l.tier === tier);
      if (exists) return prev;
      return [...prev, { floor, shelf, tier, notes: newLocNotes }];
    });

    if (selectedPath) {
      setExpandedPaths(prev => new Set(prev).add(selectedPath));
    }

    setNewLocName("");
    setNewLocNotes("");
    setIsAddingLocation(false);
  };

  const handleDeleteLocation = async (pathToDelete: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá vị trí này?')) return;
    const parts = pathToDelete.split('|');

    const floor = parts[0];
    const shelf = parts[1] || "";
    const tier = parts[2] || "";

    const res = await deleteLocation(floor, shelf, tier);
    if (!res.success) {
      alert("Lỗi khi xoá vị trí: " + res.error);
      return;
    }

    setCustomLocations(prev => prev.filter(loc => {
      if (parts.length === 1) return loc.floor !== parts[0];
      if (parts.length === 2) return !(loc.floor === parts[0] && loc.shelf === parts[1]);
      if (parts.length === 3) return !(loc.floor === parts[0] && loc.shelf === parts[1] && loc.tier === parts[2]);
      return true;
    }));

    if (selectedPath.startsWith(pathToDelete)) {
      setSelectedPath("");
    }
  };

  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPath) return;

    const parts = selectedPath.split('|');
    const floor = parts[0];
    const shelf = parts[1] || "";
    const tier = parts[2] || "";

    // Determine level
    const level = parts.length - 1; // 0 for floor, 1 for shelf, 2 for tier
    const currentName = parts[parts.length - 1];

    let success = true;

    // Only call rename if name changed
    if (editLocName !== currentName) {
      const resRename = await renameLocation(floor, shelf, tier, editLocName, level);
      if (!resRename.success) {
        alert("Lỗi khi đổi tên: " + resRename.error);
        success = false;
      }
    }

    // Call update notes
    const resNotes = await updateLocationNotes(
      level === 0 ? editLocName : floor,
      level === 1 ? editLocName : shelf,
      level === 2 ? editLocName : tier,
      editLocNotes
    );

    if (!resNotes.success) {
      alert("Lỗi khi cập nhật ghi chú: " + resNotes.error);
      success = false;
    }

    if (success) {
      // Refresh tree
      setCustomLocations(prev => prev.map(loc => {
        if (loc.floor === floor && (loc.shelf || "") === shelf && (loc.tier || "") === tier) {
          return {
            ...loc,
            notes: editLocNotes,
            floor: level === 0 ? editLocName : loc.floor,
            shelf: level === 1 ? editLocName : loc.shelf,
            tier: level === 2 ? editLocName : loc.tier
          };
        }
        return loc;
      }));

      // Update selected path if name changed
      if (editLocName !== currentName) {
         const newParts = [...parts];
         newParts[newParts.length - 1] = editLocName;
         setSelectedPath(newParts.join('|'));

         // Also update expanded paths
         setExpandedPaths(prev => {
           const newSet = new Set(prev);
           newSet.delete(selectedPath);
           newSet.add(newParts.join('|'));
           return newSet;
         });
      }

      setIsEditingLocation(false);
    }
  };

  // Render Tree Node
  const renderTreeNode = (node: any, path: string, level: number) => {
    const hasChildren = Object.keys(node.children).length > 0;
    const isExpanded = expandedPaths.has(path);
    const isSelected = selectedPath === path;

    let Icon = Box;
    if (level === 0) Icon = Layers;
    else if (level === 1) Icon = MapPin;

    let titleClass = "";
    let iconClass = "";
    let itemClass = `flex items-start gap-1.5 py-2 px-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100'}`;

    if (level === 0) {
      titleClass = "text-[14px] font-bold uppercase tracking-wide truncate";
      iconClass = `w-4 h-4 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`;
      itemClass += ` mt-2 mb-1 ${!isSelected ? 'text-slate-800' : ''}`;
    } else if (level === 1) {
      titleClass = "text-[14px] font-semibold truncate";
      iconClass = `w-4 h-4 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`;
      itemClass += ` mt-1 ${!isSelected ? 'text-slate-700' : ''}`;
    } else {
      titleClass = "text-[13.5px] font-normal truncate";
      iconClass = `w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`;
      itemClass += ` ${!isSelected ? 'text-slate-600' : ''}`;
    }

    return (
      <div key={path} className="select-none">
        <div
          className={itemClass}
          onClick={() => {
            setSelectedPath(path);
            setIsMobileTreeOpen(false);
          }}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div
            className={`w-5 h-5 flex flex-shrink-0 items-center justify-center rounded hover:bg-slate-200 transition-colors ${hasChildren ? 'cursor-pointer' : 'opacity-0'}`}
            onClick={(e) => hasChildren && toggleExpand(path, e)}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Icon className={iconClass} />
              <span className={titleClass}>{node.name}</span>
            </div>
            {node.notes && (
              <span className={`text-[11px] mt-0.5 truncate italic ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>
                {node.notes}
              </span>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-0.5">

            {(() => {
              let sorted = Object.values(node.children).sort((a: any, b: any) => smartLocationSort(a.name, b.name));
              const order = customOrder[path];
              if (order && order.length > 0) {
                sorted.sort((a: any, b: any) => {
                  const idxA = order.indexOf(a.name);
                  const idxB = order.indexOf(b.name);
                  if (idxA === -1 && idxB === -1) return 0;
                  if (idxA === -1) return 1;
                  if (idxB === -1) return -1;
                  return idxA - idxB;
                });
              }
              return sorted.map((childNode: any) => renderTreeNode(childNode, `${path}|${childNode.name}`, level + 1));
            })()}

          </div>
        )}
      </div>
    );
  };

  const getAddLabel = () => {
    if (addTargetLevel === 'floor') return 'Thêm Tầng';
    if (addTargetLevel === 'shelf') return 'Thêm Vị trí';
    return '';
  };

  // Current Level info for Main Content
  const selectedParts = selectedPath ? selectedPath.split('|') : [];
  const currentChildren = useMemo(() => {
    if (!selectedPath) return Object.values(tree);
    let currentNode: any = tree[selectedParts[0]];
    for (let i = 1; i < selectedParts.length; i++) {
      if (currentNode && currentNode.children) {
        currentNode = currentNode.children[selectedParts[i]];
      } else {
        return [];
      }
    }

    const children: any[] = currentNode ? Object.values(currentNode.children) : [];

    // Sort smartly first
    let sorted = [...children].sort((a, b) => smartLocationSort(a.name, b.name));

    // Then apply custom order if exists
    const order = customOrder[selectedPath];
    if (order && order.length > 0) {
      sorted.sort((a, b) => {
        const indexA = order.indexOf(a.name);
        const indexB = order.indexOf(b.name);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    return sorted;
  }, [tree, selectedPath, selectedParts]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative print:h-auto print:overflow-visible">
      {/* Mobile Tree Backdrop */}
      {isMobileTreeOpen && (
        <div 
          className="md:hidden absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 print:hidden" 
          onClick={() => setIsMobileTreeOpen(false)} 
        />
      )}

      {/* LEFT SIDEBAR: TREE VIEW */}
      <div className={`${isMobileTreeOpen ? 'flex' : 'hidden'} md:flex absolute md:relative inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex-col h-full shadow-[2px_0_15px_-3px_rgba(0,0,0,0.05)] z-50 print:hidden`}>
        <div className="md:hidden p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> Cây Thư Mục Kho
          </h2>
          <button onClick={() => setIsMobileTreeOpen(false)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div
            className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors mb-2 ${selectedPath === '' ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
            onClick={() => {
              setSelectedPath("");
              setIsMobileTreeOpen(false);
            }}
          >
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-sm">Toàn bộ kho</span>
          </div>

          <div className="space-y-0.5">

            {(() => {
              let sorted = Object.values(tree).sort((a: any, b: any) => smartLocationSort(a.name, b.name));
              const order = customOrder[''];
              if (order && order.length > 0) {
                sorted.sort((a: any, b: any) => {
                  const idxA = order.indexOf(a.name);
                  const idxB = order.indexOf(b.name);
                  if (idxA === -1 && idxB === -1) return 0;
                  if (idxA === -1) return 1;
                  if (idxB === -1) return -1;
                  return idxA - idxB;
                });
              }
              return sorted.map((node: any) => renderTreeNode(node, node.name, 0));
            })()}

            {Object.keys(tree).length === 0 && (
              <div className="text-center p-4 text-sm text-slate-400">
                Chưa có sơ đồ kho.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white print:h-auto print:overflow-visible">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4 print:hidden">
          {/* Main Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 flex-1 min-w-0">
              
              {/* Breadcrumb / Back button (if inside a folder or in table view) */}
              <div className="flex items-center gap-2">
                {(selectedParts.length > 0 || viewMode === 'table') && (
                  <button 
                    onClick={() => {
                      if (viewMode === 'table') {
                        setViewMode('tree');
                      } else {
                        const newParts = selectedParts.slice(0, -1);
                        setSelectedPath(newParts.join('|'));
                      }
                    }}
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Quay lại</span>
                  </button>
                )}
                <h2 className="text-xl md:text-2xl font-black text-slate-800 ml-1 truncate">
                  {selectedParts.length === 0 ? (viewMode === 'table' ? "Danh sách Mã QR" : "Sơ đồ Không gian kho") : 
                   selectedParts.length === 2 ? `${selectedParts[0]} - Vị trí ${selectedParts[1]}` :
                   selectedParts.join(' - ')}
                </h2>
              </div>

              {/* Show Notes if available */}
              {(() => {
                if (selectedParts.length === 0) return null;
                const currentLocation = customLocations.find(l =>
                  l.floor === selectedParts[0] &&
                  (l.shelf || "") === (selectedParts[1] || "") &&
                  (l.tier || "") === (selectedParts[2] || "")
                );
                if (currentLocation?.notes) {
                  return (
                    <div className="text-sm text-slate-600 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-lg flex gap-2 items-center max-w-xl">
                      <Info className="w-4 h-4 flex-shrink-0 text-indigo-500" />
                      <p className="truncate">{currentLocation.notes}</p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {viewMode === 'tree' ? (
                <button
                  onClick={() => setViewMode('table')}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                  title="Xem danh sách QR"
                >
                  <QrCode className="w-4 h-4" /> <span>Xem danh sách QR</span>
                </button>
              ) : null}

              {viewMode === 'table' && (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                  title="In hàng loạt mã QR đang hiển thị"
                >
                  <Printer className="w-4 h-4" /> <span>Xem bảng in mã</span>
                </button>
              )}
              
              {selectedParts.length > 0 && viewMode === 'tree' && (
                <a
                  href={`/dashboard/inventory/catalog/new?floor=${encodeURIComponent(selectedParts[0] || "")}&shelf=${encodeURIComponent(selectedParts[1] || "")}&tier=${encodeURIComponent(selectedParts[2] || "")}`}
                  className="p-2 md:px-4 md:py-2 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                  title="Nhập hàng vào đây"
                >
                  <PackagePlus className="w-5 h-5 md:w-4 md:h-4" /> <span className="hidden md:inline">Nhập hàng</span>
                </a>
              )}
              
              {/* Edit and Delete buttons removed by user request */}

              {/* Desktop Add Button (hidden on mobile, replaced by FAB) */}
              {selectedParts.length < 2 && viewMode === 'tree' && (
                <button
                  onClick={() => setIsAddingLocation(true)}
                  className="hidden md:flex whitespace-nowrap px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors items-center gap-2 shadow-sm text-sm"
                >
                  <Plus className="w-4 h-4" /> {getAddLabel()}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        {viewMode === 'tree' && (
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm trên toàn hệ thống kho (Tên, Mã QR, SKU)..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm shadow-sm transition-colors"
              />
              {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5 animate-spin" />}
              {!isSearching && globalSearch && (
                <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 print:overflow-visible print:p-0 print:bg-white">
          
          {viewMode === 'table' ? (
            <>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden print:hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="px-4 py-3">Tầng</th>
                      <th className="px-4 py-3">Vị Trí</th>
                      <th className="px-4 py-3">Mã Vị Trí</th>
                      <th className="px-4 py-3 text-center">Mã QR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customLocations
                      .filter(loc => {
                        if (selectedParts.length === 0) return true;
                        if (selectedParts.length >= 1 && loc.floor !== selectedParts[0]) return false;
                        if (selectedParts.length >= 2 && loc.shelf !== selectedParts[1]) return false;
                        if (selectedParts.length >= 3 && loc.tier !== selectedParts[2]) return false;
                        return true;
                      })
                      .sort((a, b) => {
                        if (a.floor !== b.floor) return smartLocationSort(a.floor, b.floor);
                        const shelfA = a.shelf || '';
                        const shelfB = b.shelf || '';
                        return shelfA.localeCompare(shelfB, undefined, { numeric: true });
                      })
                      .map((loc, idx) => {
                      const codeParts = [loc.floor, loc.shelf, loc.tier].filter(Boolean);
                      const locCode = codeParts.map(s => s.trim().toUpperCase().replace(/\s+/g, '-')).join('-');
                      const qrDataUrl = qrImages[locCode];
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800">{loc.floor}</td>
                          <td className="px-4 py-3">{loc.shelf || '-'}</td>
                          <td className="px-4 py-3 font-mono text-indigo-600 text-xs">{locCode}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center gap-2">
                              {qrDataUrl ? (
                                <>
                                  <img src={qrDataUrl} alt={locCode} className="w-24 object-contain rounded border border-slate-200 shadow-sm bg-white" />
                                  <a href={qrDataUrl} download={`QR-${locCode}.png`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] flex items-center gap-1 font-bold text-indigo-600 hover:bg-indigo-100 transition-colors">
                                    <Download className="w-3.5 h-3.5" /> Tải về
                                  </a>
                                </>
                              ) : (
                                <div className="w-24 h-24 flex items-center justify-center bg-slate-50 border border-slate-100 rounded">
                                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {customLocations.filter(loc => {
                        if (selectedParts.length === 0) return true;
                        if (selectedParts.length >= 1 && loc.floor !== selectedParts[0]) return false;
                        return true;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Chưa có vị trí nào trong khu vực này.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Hidden Print Layout */}
            <div id="print-batch-area" className="hidden print:block w-full">
               <div className="grid grid-cols-4 gap-4 w-full" style={{ pageBreakInside: 'avoid' }}>
                 {customLocations
                    .filter(loc => {
                      if (selectedParts.length === 0) return true;
                      if (selectedParts.length >= 1 && loc.floor !== selectedParts[0]) return false;
                      if (selectedParts.length >= 2 && loc.shelf !== selectedParts[1]) return false;
                      return true;
                    })
                    .sort((a, b) => {
                      if (a.floor !== b.floor) return smartLocationSort(a.floor, b.floor);
                      const shelfA = a.shelf || '';
                      const shelfB = b.shelf || '';
                      return shelfA.localeCompare(shelfB, undefined, { numeric: true });
                    })
                    .map((loc, idx) => {
                      const codeParts = [loc.floor, loc.shelf, loc.tier].filter(Boolean);
                      const locCode = codeParts.map(s => s.trim().toUpperCase().replace(/\s+/g, '-')).join('-');
                      const qrDataUrl = qrImages[locCode];
                      if (!qrDataUrl) return null;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center justify-center border border-slate-300 p-2 break-inside-avoid text-center">
                          <img src={qrDataUrl} alt={locCode} className="w-20 h-20 object-contain mb-1" />
                          <div className="font-bold text-slate-900 leading-tight" style={{ fontSize: '11px' }}>{locCode}</div>
                        </div>
                      );
                 })}
               </div>
            </div>
            </>
          ) : globalSearch.trim() ? (
            <div className="print:hidden">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Search className="w-4 h-4" /> Kết quả tìm kiếm ({searchResults.length})
              </h3>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.map(p => (
                    <ProductCard key={p.id} p={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm flex items-center justify-center min-h-[200px]">
                  Không tìm thấy sản phẩm nào khớp với "{globalSearch}".
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="print:hidden">
                {selectedParts.length < 2 ? (
                  // Show Sub-Folders
                  <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Danh sách Vị trí</h3>
              {currentChildren.length > 0 ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="locations-grid" direction="horizontal">
                      {(provided) => (
                        <div
                          className="flex flex-col gap-2"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {currentChildren.map((child: any, index: number) => {
                            const childPath = selectedPath ? `${selectedPath}|${child.name}` : child.name;
                            return (
                              <Draggable key={child.name} draggableId={child.name} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => setSelectedPath(childPath)}
                                    className={`bg-white px-4 py-3 rounded-lg border ${snapshot.isDragging ? 'border-indigo-500 shadow-lg scale-[1.01] z-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'} cursor-pointer transition-all flex items-center justify-between group`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <MapPin className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{child.name}</h4>
                                        {child.notes && (
                                          <p className="text-xs text-slate-500 italic flex items-center gap-1 mt-0.5"><Info className="w-3 h-3"/> {child.notes}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                                         {Object.keys(child.children).length} thành phần con
                                       </span>
                                       <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <MapPin className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium mb-1">Khu vực này hiện đang trống</p>
                  <p className="text-sm text-slate-400 mb-4">Nhấn nút thêm ở góc trên để tạo mới.</p>
                  <button onClick={() => setIsAddingLocation(true)} className="text-indigo-600 font-semibold text-sm hover:underline">
                    {getAddLabel()} ngay
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Show Products (Always show products at this location level) */}
          {selectedParts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Sản phẩm tại đây
              </h3>
              {isLoadingProducts ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center shadow-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-slate-500 font-medium">Đang tải sản phẩm...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(p => (
                    <ProductCard key={p.id} p={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 md:p-12 text-center flex flex-col items-center justify-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-2 border-slate-100">
                    <Shirt className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium text-lg mb-1">Chưa có sản phẩm nào</p>
                  <p className="text-sm text-slate-400 max-w-md">
                    Chưa có sản phẩm nào được lưu trữ TRỰC TIẾP tại vị trí này. Hãy kiểm tra các thư mục con hoặc chuyển sang phần Nhập Hàng để thêm mới.
                  </p>
                </div>
              )}
            </div>
          )}
              </div>
            </>
          )}

        </div>
      </div>

      {/* Modal Add Location */}
      {isAddingLocation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{getAddLabel()}</h3>
              <button onClick={() => setIsAddingLocation(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddNewLocation}>
              <div className="p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên {addTargetLevel === 'floor' ? 'Lầu/Tầng' : addTargetLevel === 'shelf' ? 'Kệ/Sào' : 'Ngăn/Móc'}</label>
                <input
                  autoFocus
                  required
                  value={newLocName}
                  onChange={e => setNewLocName(e.target.value)}
                  type="text"
                  placeholder={addTargetLevel === 'floor' ? 'VD: Lầu 1, Tầng trệt...' : addTargetLevel === 'shelf' ? 'VD: Sào váy xoè, Tủ kính...' : 'VD: Ngăn trên, Ngăn dưới...'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />

                <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">Ghi chú (Tuỳ chọn)</label>
                <textarea
                  value={newLocNotes}
                  onChange={e => setNewLocNotes(e.target.value)}
                  rows={2}
                  placeholder="VD: Khu vực chứa đồ VIP, Hàng xuất khẩu..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                />

                {selectedPath && (
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Được đặt bên trong: <strong className="text-slate-700">{selectedPath.replace(/\|/g, ' > ')}</strong>
                  </p>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button type="button" onClick={() => setIsAddingLocation(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                  Huỷ
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all">
                  Tạo Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Location */}
      {isEditingLocation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Chỉnh sửa Vị trí</h3>
              <button onClick={() => setIsEditingLocation(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleEditLocation}>
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4 flex items-center gap-1.5 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  Đang chỉnh sửa: <strong className="text-indigo-700">{selectedPath.replace(/\|/g, ' > ')}</strong>
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tên vị trí</label>
                  <input
                    autoFocus
                    required
                    value={editLocName}
                    onChange={e => setEditLocName(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nội dung Ghi chú</label>
                  <textarea
                    value={editLocNotes}
                    onChange={e => setEditLocNotes(e.target.value)}
                    rows={3}
                    placeholder="VD: Khu vực chứa đồ VIP, Hàng xuất khẩu..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button type="button" onClick={() => setIsEditingLocation(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                  Huỷ
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Add Location FAB */}
      {!isMobileTreeOpen && selectedParts.length < 2 && viewMode === 'tree' && (
        <button
          onClick={() => setIsAddingLocation(true)}
          className="md:hidden absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-30 print:hidden"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Item Journey Popup */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><CalendarIcon size={18} className="text-indigo-600"/> Lịch trình hoạt động 30 ngày</h2>
              <button onClick={() => setSelectedProduct(null)} className="p-2 bg-white rounded-full hover:bg-slate-200 text-slate-500"><X size={16} /></button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <div className="flex gap-4 items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="w-16 h-20 bg-white rounded-lg overflow-hidden shrink-0 border border-slate-200 relative">
                   <ImageWithFallback src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight">{selectedProduct.name}</h3>
                   <div className="text-sm font-mono text-indigo-600 mt-1">{selectedProduct.qr_code}</div>
                   <div className="text-xs text-slate-500 mt-1">SKU: {selectedProduct.sku} • Size: {selectedProduct.size || '—'}</div>
                 </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 mb-6">
                <CalendarIcon className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <strong className="text-indigo-900 block text-sm">Chế độ giả lập (Mock Data)</strong>
                  <p className="text-xs text-indigo-700 mt-1">Khi module Hợp đồng hoàn tất, lịch thuê thực tế sẽ được fill vào bảng này.</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-sm text-slate-700 flex justify-between items-center">
                  <span>Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</span>
                  <div className="flex gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Trống</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Đã xếp lịch</span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-7 gap-2 text-center text-xs">
                  {["T2","T3","T4","T5","T6","T7","CN"].map(d => <div key={d} className="font-bold text-slate-400 mb-2">{d}</div>)}
                  {Array.from({length: 31}).map((_, i) => {
                    const isRented = [5, 6, 12, 13, 25].includes(i + 1);
                    return (
                      <div key={i} className={`aspect-square flex items-center justify-center rounded-lg font-medium cursor-help transition-transform hover:scale-110 ${isRented ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-100'}`} title={isRented ? "Lịch Hợp đồng HĐ-1029" : "Trống"}>
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
