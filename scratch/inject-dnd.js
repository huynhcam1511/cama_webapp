const fs = require('fs');
const path = 'src/app/dashboard/inventory/locations/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add imports
if (!code.includes('DragDropContext')) {
  code = code.replace("import { Layers, Plus,", "import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';\nimport { Layers, Plus,");
}

// Add state for custom ordering
if (!code.includes('customOrder')) {
  const stateInjectionPoint = code.indexOf('const [customLocations, setCustomLocations] = useState');
  const customOrderState = `  const [customOrder, setCustomOrder] = useState<Record<string, string[]>>({});
  
  // Load order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cama_location_order');
    if (saved) {
      try { setCustomOrder(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save order to localStorage
  useEffect(() => {
    localStorage.setItem('cama_location_order', JSON.stringify(customOrder));
  }, [customOrder]);

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
`;
  code = code.slice(0, stateInjectionPoint) + customOrderState + code.slice(stateInjectionPoint);
}

// Update currentChildren to sort alphabetically then apply customOrder
const currentChildrenIdx = code.indexOf('return currentNode ? Object.values(currentNode.children) : [];');
if (currentChildrenIdx !== -1 && !code.includes('sorted.sort')) {
  const newCurrentChildren = `
    const children: any[] = currentNode ? Object.values(currentNode.children) : [];
    
    // Sort A-Z first
    let sorted = [...children].sort((a, b) => a.name.localeCompare(b.name));
    
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
    return sorted;`;
  code = code.replace('return currentNode ? Object.values(currentNode.children) : [];', newCurrentChildren);
}

// Similarly, sort the TreeView nodes
const treeNodesIdx = code.indexOf('{Object.values(tree).map((node: any) => renderTreeNode(node, node.name, 0))}');
if (treeNodesIdx !== -1) {
    const replacement = `
            {(() => {
              let sorted = Object.values(tree).sort((a: any, b: any) => a.name.localeCompare(b.name));
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
`;
    code = code.replace('{Object.values(tree).map((node: any) => renderTreeNode(node, node.name, 0))}', replacement);
}

const childNodesIdx = code.indexOf('{Object.values(node.children).map((childNode: any) =>');
if (childNodesIdx !== -1) {
    const replacement = `
            {(() => {
              let sorted = Object.values(node.children).sort((a: any, b: any) => a.name.localeCompare(b.name));
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
              return sorted.map((childNode: any) => renderTreeNode(childNode, \`\${path}|\${childNode.name}\`, level + 1));
            })()}
`;
    // We need to replace the whole map block
    // It looks like:
    /*
            {Object.values(node.children).map((childNode: any) => 
              renderTreeNode(childNode, `${path}|${childNode.name}`, level + 1)
            )}
    */
    code = code.replace(
        /{Object\.values\(node\.children\)\.map\(\(childNode: any\) => \s*renderTreeNode\(childNode, `\${path}\|\${childNode\.name}`, level \+ 1\)\s*\)}/m, 
        replacement
    );
}


// Replace the Grid with DragDropContext
const gridStartIdx = code.indexOf('<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">');
if (gridStartIdx !== -1) {
  const gridEndIdx = code.indexOf('</div>', gridStartIdx) + 6; // Needs to find the matching closing div carefully, but we know it's a simple block.
  
  // Actually replacing the specific block is tricky with indexOf if nested.
  // Let's use regex to grab the block.
  const blockRegex = /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">[\s\S]*?<\/div>\s*\)\s*:\s*\(/;
  
  const newGrid = `
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="locations-grid" direction="horizontal">
                      {(provided) => (
                        <div 
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {currentChildren.map((child: any, index: number) => {
                            const childPath = selectedPath ? \`\${selectedPath}|\${child.name}\` : child.name;
                            return (
                              <Draggable key={child.name} draggableId={child.name} index={index}>
                                {(provided, snapshot) => (
                                  <div 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => setSelectedPath(childPath)}
                                    className={\`bg-white p-4 rounded-xl border \${snapshot.isDragging ? 'border-indigo-500 shadow-xl scale-105 z-50 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'} cursor-pointer transition-all flex items-center gap-3 group\`}
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                      <MapPin className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-slate-800">{child.name}</h4>
                                      <p className="text-xs text-slate-500">{Object.keys(child.children).length} thành phần con</p>
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
  `;
  
  code = code.replace(blockRegex, newGrid.trim());
}

fs.writeFileSync(path, code);
