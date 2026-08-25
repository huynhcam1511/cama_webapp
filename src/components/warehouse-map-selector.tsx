"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Layers, MapPin, ChevronRight, ChevronDown, Box, Loader2 } from 'lucide-react';
import { getCustomLocations, getLocationOrder } from '@/app/dashboard/inventory/locations/actions';

const smartLocationSort = (aName: string, bName: string) => {
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

  return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
};

interface WarehouseMapSelectorProps {
  onSelectLocation: (floor: string, shelf: string, tier: string) => void;
  selectedFloor?: string;
  selectedShelf?: string;
  selectedTier?: string;
}

export default function WarehouseMapSelector({
  onSelectLocation,
  selectedFloor,
  selectedShelf,
  selectedTier
}: WarehouseMapSelectorProps) {
  const [customOrder, setCustomOrder] = useState<Record<string, string[]>>({});
  const [customLocations, setCustomLocations] = useState<{floor: string, shelf: string, tier: string, notes?: string}[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Determine selected path from props
  const selectedPath = useMemo(() => {
    const parts = [selectedFloor, selectedShelf, selectedTier].filter(Boolean) as string[];
    return parts.join('|');
  }, [selectedFloor, selectedShelf, selectedTier]);

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

  // Auto-expand tree sidebar based on selection
  useEffect(() => {
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

  const handleSelectPath = (path: string) => {
    const parts = path.split('|');
    const floor = parts[0] || "";
    const shelf = parts[1] || "";
    const tier = parts[2] || "";
    onSelectLocation(floor, shelf, tier);
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
          onClick={() => handleSelectPath(path)}
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

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const rootNodes = Object.values(tree).sort((a: any, b: any) => smartLocationSort(a.name, b.name));
  const order = customOrder[""];
  if (order && order.length > 0) {
    rootNodes.sort((a: any, b: any) => {
      const idxA = order.indexOf(a.name);
      const idxB = order.indexOf(b.name);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  return (
    <div className="w-full h-full overflow-y-auto pr-2 pb-10">
      {rootNodes.map((node: any) => renderTreeNode(node, node.name, 0))}
      {rootNodes.length === 0 && (
        <div className="text-center text-slate-500 p-8 text-sm">
          Chưa có sơ đồ kho nào. Vui lòng tạo vị trí kho trước.
        </div>
      )}
    </div>
  );
}
