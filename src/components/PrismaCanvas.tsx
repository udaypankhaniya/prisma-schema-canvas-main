
import React, { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ModelNode } from './ModelNode';
import { Toolbar } from './Toolbar';
import { ModelSidebar } from './ModelSidebar';
import { ImportSchemaDialog } from './ImportSchemaDialog';
import { FieldRelationshipEdge } from './FieldRelationshipEdge';
import { SearchBar } from './SearchBar';
import { parsePrismaSchema, validatePrismaSchema } from '@/utils/schemaParser';
import { toast } from 'sonner';

interface Field {
  name: string;
  type: string;
  modifiers: string[];
  isRelation?: boolean;
  relationTo?: string;
}

interface ModelNodeData {
  name: string;
  fields: Field[];
  highlighted?: boolean;
  faded?: boolean;
  onDelete?: (nodeId: string) => void;
}

interface EnumInfo {
  name: string;
  values: string[];
}

// Default nodes with proper Node type structure
const defaultNodes: Node<ModelNodeData>[] = [
  {
    id: '1',
    type: 'model',
    position: { x: 100, y: 100 },
    data: {
      name: 'User',
      fields: [
        { name: 'id', type: 'String', modifiers: ['@id', '@default(cuid())'] },
        { name: 'email', type: 'String', modifiers: ['@unique'] },
        { name: 'name', type: 'String', modifiers: ['?'] },
        { name: 'role', type: 'Role', modifiers: ['@default(USER)'] },
        { name: 'posts', type: 'Post[]', modifiers: [], isRelation: true, relationTo: 'Post' },
        { name: 'createdAt', type: 'DateTime', modifiers: ['@default(now())'] },
        { name: 'updatedAt', type: 'DateTime', modifiers: ['@updatedAt'] },
      ],
    },
  },
  {
    id: '2',
    type: 'model',
    position: { x: 400, y: 100 },
    data: {
      name: 'Post',
      fields: [
        { name: 'id', type: 'String', modifiers: ['@id', '@default(cuid())'] },
        { name: 'title', type: 'String', modifiers: [] },
        { name: 'content', type: 'String', modifiers: ['?'] },
        { name: 'status', type: 'Status', modifiers: ['@default(DRAFT)'] },
        { name: 'published', type: 'Boolean', modifiers: ['@default(false)'] },
        { name: 'authorId', type: 'String', modifiers: [] },
        { name: 'author', type: 'User', modifiers: ['@relation(fields: [authorId], references: [id])'], isRelation: true, relationTo: 'User' },
        { name: 'createdAt', type: 'DateTime', modifiers: ['@default(now())'] },
      ],
    },
  },
  {
    id: '3',
    type: 'model',
    position: { x: 250, y: 350 },
    data: {
      name: 'Category',
      fields: [
        { name: 'id', type: 'String', modifiers: ['@id', '@default(cuid())'] },
        { name: 'name', type: 'String', modifiers: ['@unique'] },
        { name: 'description', type: 'String', modifiers: ['?'] },
        { name: 'priority', type: 'Priority', modifiers: ['@default(LOW)'] },
        { name: 'posts', type: 'Post[]', modifiers: [], isRelation: true, relationTo: 'Post' },
        { name: 'createdAt', type: 'DateTime', modifiers: ['@default(now())'] },
      ],
    },
  },
];

const defaultEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: 'posts-source',
    targetHandle: 'author-target',
    type: 'fieldRelationship',
    animated: true,
    data: {
      sourceField: 'posts',
      targetField: 'author',
      relationType: 'oneToMany',
      relationDetails: {
        fields: ['authorId'],
        references: ['id']
      }
    }
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    sourceHandle: 'category-source',
    targetHandle: 'posts-target',
    type: 'fieldRelationship',
    animated: true,
    data: {
      sourceField: 'category',
      targetField: 'posts',
      relationType: 'manyToOne',
      relationDetails: {
        fields: ['categoryId'],
        references: ['id']
      }
    }
  },
];

// Default enums
const defaultEnums: EnumInfo[] = [
  {
    name: 'Role',
    values: ['USER', 'ADMIN', 'MODERATOR']
  },
  {
    name: 'Status',
    values: ['DRAFT', 'PUBLISHED', 'ARCHIVED']
  },
  {
    name: 'Priority',
    values: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
  }
];

const PrismaCanvasContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<ModelNodeData>(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [enums, setEnums] = useState<EnumInfo[]>(defaultEnums);
  const [selectedNode, setSelectedNode] = useState<Node<ModelNodeData> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getNode } = useReactFlow();

  // Delete model function
  const deleteModel = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    
    // Close sidebar if deleted node was selected
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setSidebarOpen(false);
    }
    
    toast.success('Model deleted successfully');
  }, [setNodes, setEdges, selectedNode]);

  // Add delete function to all nodes
  const nodesWithDelete = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onDelete: deleteModel
      }
    }));
  }, [nodes, deleteModel]);

  const nodeTypes = useMemo(() => ({
    model: ModelNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    fieldRelationship: FieldRelationshipEdge,
  }), []);

  // Handle search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // Clear search - reset all nodes
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            highlighted: false,
            faded: false,
          },
        }))
      );
      return;
    }

    const searchTerm = query.toLowerCase();
    let foundNodeId: string | null = null;

    setNodes((nds) =>
      nds.map((node) => {
        const modelName = node.data.name.toLowerCase();
        const isMatch = modelName.includes(searchTerm);
        
        if (isMatch && !foundNodeId) {
          foundNodeId = node.id;
        }

        return {
          ...node,
          data: {
            ...node.data,
            highlighted: isMatch,
            faded: !isMatch,
          },
        };
      })
    );

    // Center the view on the first found node
    if (foundNodeId) {
      setTimeout(() => {
        const node = getNode(foundNodeId);
        if (node) {
          fitView({
            nodes: [{ id: foundNodeId }],
            duration: 800,
            padding: 0.3,
          });
        }
      }, 100);
    }
  }, [setNodes, fitView, getNode]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'fieldRelationship',
        animated: true,
        data: {
          sourceField: params.sourceHandle?.replace('-source', '') || '',
          targetField: params.targetHandle?.replace('-target', '') || '',
          relationType: 'oneToOne',
          relationDetails: {
            fields: [],
            references: []
          }
        }
      };
      setEdges((eds) => addEdge(edge, eds));
      toast.success('Relationship created successfully');
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<ModelNodeData>) => {
    setSelectedNode(node);
    setSidebarOpen(true);
  }, []);

  const onNodesChangeHandler = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const addNewModel = useCallback(() => {
    const newNode: Node<ModelNodeData> = {
      id: Date.now().toString(),
      type: 'model',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        name: 'NewModel',
        fields: [
          { name: 'id', type: 'String', modifiers: ['@id', '@default(cuid())'] },
          { name: 'createdAt', type: 'DateTime', modifiers: ['@default(now())'] },
          { name: 'updatedAt', type: 'DateTime', modifiers: ['@updatedAt'] },
        ],
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success('New model added successfully');
  }, [setNodes]);

  // Enhanced auto-layout with better spacing and clustering
  const autoLayout = useCallback(() => {
    console.log('Starting enhanced auto layout');
    
    const canvasWidth = window.innerWidth - 400;
    const canvasHeight = window.innerHeight - 100;
    const nodeWidth = 260;
    const nodeHeight = 220;
    const horizontalSpacing = 120;
    const verticalSpacing = 100;
    
    // Create relationship map for clustering
    const relationshipMap = new Map<string, Set<string>>();
    
    // Build relationship graph
    edges.forEach(edge => {
      if (!relationshipMap.has(edge.source)) {
        relationshipMap.set(edge.source, new Set());
      }
      if (!relationshipMap.has(edge.target)) {
        relationshipMap.set(edge.target, new Set());
      }
      relationshipMap.get(edge.source)?.add(edge.target);
      relationshipMap.get(edge.target)?.add(edge.source);
    });

    // Find clusters using connected components
    const visited = new Set<string>();
    const clusters: string[][] = [];
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const cluster: string[] = [];
        const queue = [node.id];
        
        while (queue.length > 0) {
          const current = queue.shift()!;
          if (visited.has(current)) continue;
          
          visited.add(current);
          cluster.push(current);
          
          const neighbors = relationshipMap.get(current) || new Set();
          neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          });
        }
        
        clusters.push(cluster);
      }
    });

    console.log('Found clusters:', clusters);

    // Layout clusters
    const updatedNodes = nodes.map((node) => {
      const clusterIndex = clusters.findIndex(cluster => cluster.includes(node.id));
      const cluster = clusters[clusterIndex];
      const nodeIndexInCluster = cluster.indexOf(node.id);
      
      // Calculate cluster grid dimensions
      const nodesPerRow = Math.min(3, cluster.length);
      const rows = Math.ceil(cluster.length / nodesPerRow);
      
      // Calculate cluster position
      const clustersPerRow = Math.max(1, Math.floor(canvasWidth / (nodesPerRow * (nodeWidth + horizontalSpacing))));
      const clusterRow = Math.floor(clusterIndex / clustersPerRow);
      const clusterCol = clusterIndex % clustersPerRow;
      
      const clusterOffsetX = clusterCol * (nodesPerRow * (nodeWidth + horizontalSpacing) + 200);
      const clusterOffsetY = clusterRow * (rows * (nodeHeight + verticalSpacing) + 150);
      
      // Calculate node position within cluster
      const nodeRow = Math.floor(nodeIndexInCluster / nodesPerRow);
      const nodeCol = nodeIndexInCluster % nodesPerRow;
      
      const x = 100 + clusterOffsetX + nodeCol * (nodeWidth + horizontalSpacing);
      const y = 100 + clusterOffsetY + nodeRow * (nodeHeight + verticalSpacing);
      
      // Add small random offset for natural appearance
      const randomX = (Math.random() - 0.5) * 30;
      const randomY = (Math.random() - 0.5) * 30;
      
      return {
        ...node,
        position: {
          x: Math.max(50, x + randomX),
          y: Math.max(50, y + randomY),
        },
      };
    });
    
    setNodes(updatedNodes);
    
    // Fit view after layout
    setTimeout(() => {
      fitView({ padding: 0.1, duration: 1000 });
    }, 100);
    
    toast.success(`Layout optimized with ${clusters.length} clusters`);
  }, [nodes, edges, setNodes, fitView]);

  const exportSchema = useCallback(() => {
    // Generate proper Prisma schema with correct syntax
    const generator = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

    // Add enums to the schema
    const enumsContent = enums.map(enumInfo => {
      const values = enumInfo.values.map(value => `  ${value}`).join('\n');
      return `enum ${enumInfo.name} {\n${values}\n}`;
    }).join('\n\n');

    const modelsContent = nodes
      .map((node) => {
        const nodeData = node.data;
        const fields = nodeData.fields
          .map((field: Field) => {
            const modifiersStr = field.modifiers.length > 0 ? ` ${field.modifiers.join(' ')}` : '';
            return `  ${field.name} ${field.type}${modifiersStr}`;
          })
          .join('\n');
        return `model ${nodeData.name} {\n${fields}\n}`;
      })
      .join('\n\n');
    
    const fullSchema = generator + (enumsContent ? enumsContent + '\n\n' : '') + modelsContent;
    
    const blob = new Blob([fullSchema], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.prisma';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Schema exported successfully with enums');
  }, [nodes, enums]);

  const handleImportSchema = useCallback((schemaContent: string) => {
    console.log('Importing schema content:', schemaContent);
    
    const validation = validatePrismaSchema(schemaContent);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    try {
      const { nodes: parsedNodes, edges: parsedEdges, enums: parsedEnums } = parsePrismaSchema(schemaContent);
      
      console.log('Parsed nodes:', parsedNodes);
      console.log('Parsed edges:', parsedEdges);
      console.log('Parsed enums:', parsedEnums);
      
      if (parsedNodes.length === 0) {
        toast.error('No valid models found in schema');
        return;
      }

      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setEnums(parsedEnums);
      toast.success(`Imported ${parsedNodes.length} models, ${parsedEdges.length} relationships, and ${parsedEnums.length} enums successfully`);
    } catch (error) {
      console.error('Error parsing schema:', error);
      toast.error('Failed to parse schema content');
    }
  }, [setNodes, setEdges, setEnums]);

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Toolbar
        onAddModel={addNewModel}
        onAutoLayout={autoLayout}
        onExportSchema={exportSchema}
        onImportSchema={() => setImportDialogOpen(true)}
      />
      
      {/* Search Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <SearchBar onSearch={handleSearch} placeholder="Search models by name..." />
        <div className="flex items-center gap-4">
          {searchQuery && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Searching for: "{searchQuery}"
            </div>
          )}
          {enums.length > 0 && (
            <div className="text-sm text-purple-600 dark:text-purple-400">
              {enums.length} enum{enums.length !== 1 ? 's' : ''} defined
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex">
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodesWithDelete}
            edges={edges}
            onNodesChange={onNodesChangeHandler}
            onEdgesChange={onEdgesChangeHandler}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-white dark:bg-gray-800"
            style={{ backgroundColor: '#f9fafb' }}
            connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
            defaultEdgeOptions={{
              style: { stroke: '#6366f1', strokeWidth: 2 },
              type: 'smoothstep',
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#e5e7eb"
              className="dark:opacity-30"
            />
            <Controls
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
            />
            <MiniMap
              nodeColor={(node) => {
                const nodeData = node.data as ModelNodeData;
                if (nodeData.highlighted) return '#6366f1';
                if (nodeData.faded) return '#d1d5db';
                return '#9ca3af';
              }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
            />
          </ReactFlow>
        </div>
        
        <ModelSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          node={selectedNode}
          onUpdateNode={(updatedNode) => {
            setNodes((nds) =>
              nds.map((n) => (n.id === updatedNode.id ? updatedNode : n))
            );
          }}
        />
      </div>

      <ImportSchemaDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImportSchema}
      />
    </div>
  );
};

export const PrismaCanvas = () => {
  return (
    <ReactFlowProvider>
      <PrismaCanvasContent />
    </ReactFlowProvider>
  );
};
