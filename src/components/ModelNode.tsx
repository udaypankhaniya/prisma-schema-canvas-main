
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Key, Eye, Calendar, Hash, Link, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const getFieldIcon = (field: Field) => {
  if (field.modifiers.includes('@id')) return <Key className="w-3 h-3 text-yellow-500" />;
  if (field.modifiers.includes('@unique')) return <Hash className="w-3 h-3 text-blue-500" />;
  if (field.type.includes('DateTime')) return <Calendar className="w-3 h-3 text-green-500" />;
  if (field.isRelation) return <Link className="w-3 h-3 text-indigo-500" />;
  return <Database className="w-3 h-3 text-gray-400" />;
};

const getTypeColor = (type: string, isRelation?: boolean) => {
  if (isRelation) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
  if (type === 'String') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (type === 'Int' || type === 'Float') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (type === 'Boolean') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  if (type === 'DateTime') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  if (type.includes('[]')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
};

export const ModelNode = memo(({ data, id, selected }: NodeProps<ModelNodeData>) => {
  const { name, fields, highlighted, faded, onDelete } = data;

  const handleRipple = (e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
    `;
    
    card.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  const cardClasses = `
    min-w-[200px] max-w-[240px] shadow-md hover:shadow-lg transition-all duration-300 border-2 
    ${highlighted 
      ? 'border-indigo-400 shadow-lg shadow-indigo-200 scale-105 bg-indigo-50' 
      : selected 
        ? 'border-indigo-300' 
        : 'hover:border-indigo-300'
    }
    ${faded ? 'opacity-40' : 'opacity-100'}
    dark:hover:border-indigo-600 bg-white dark:bg-gray-800 relative overflow-hidden cursor-pointer
  `;

  return (
    <>
      <Card className={cardClasses} onClick={handleRipple}>
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 bg-indigo-500 border-2 border-white dark:border-gray-800"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-indigo-500 border-2 border-white dark:border-gray-800"
        />
        
        <CardHeader className="pb-2 pt-2 px-2">
          <CardTitle className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-indigo-600" />
              {name}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-1 px-2 pb-2">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-0.5 px-1 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs relative"
              data-field-id={`${id}-${field.name}`}
            >
              {/* Field-level handles for relationships */}
              {field.isRelation && (
                <>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`${field.name}-source`}
                    className="w-1 h-1 bg-indigo-500 border border-white !right-[-2px] !transform-none !top-1/2 !-translate-y-1/2"
                  />
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`${field.name}-target`}
                    className="w-1 h-1 bg-indigo-500 border border-white !left-[-2px] !transform-none !top-1/2 !-translate-y-1/2"
                  />
                </>
              )}
              
              <div className="flex items-center gap-1 flex-1 min-w-0">
                {getFieldIcon(field)}
                <span className="font-medium text-gray-900 dark:text-white truncate text-xs">
                  {field.name}
                </span>
                {field.modifiers.includes('?') && (
                  <Eye className="w-2 h-2 text-gray-400" />
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className={`text-xs px-1 py-0 ${getTypeColor(field.type, field.isRelation)}`}
                >
                  {field.type}
                </Badge>
              </div>
            </div>
          ))}
          
          {fields.length === 0 && (
            <div className="text-center py-1 text-xs text-gray-500 dark:text-gray-400">
              No fields
            </div>
          )}
        </CardContent>
      </Card>
      
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
});

ModelNode.displayName = 'ModelNode';
