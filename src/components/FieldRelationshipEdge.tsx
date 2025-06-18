
import React, { memo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  EdgeProps,
} from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, ArrowRight } from 'lucide-react';

interface RelationData {
  sourceField: string;
  targetField: string;
  relationType: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  relationDetails?: {
    fields: string[];
    references: string[];
    onDelete?: string;
    onUpdate?: string;
  };
}

export const FieldRelationshipEdge = memo((props: EdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const relationData = (data || {}) as Partial<RelationData>;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const getRelationTypeIcon = () => {
    switch (relationData?.relationType) {
      case 'oneToOne':
        return '1:1';
      case 'oneToMany':
        return '1:N';
      case 'manyToOne':
        return 'N:1';
      case 'manyToMany':
        return 'N:N';
      default:
        return '1:1';
    }
  };

  const getRelationTypeColor = () => {
    switch (relationData?.relationType) {
      case 'oneToOne':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'oneToMany':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'manyToOne':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'manyToMany':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <TooltipProvider>
      <>
        <BaseEdge
          path={edgePath}
          style={{
            stroke: isHovered ? '#4f46e5' : '#6366f1',
            strokeWidth: isHovered ? 3 : 2,
            filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none',
            transition: 'all 0.2s ease-in-out',
          }}
          markerEnd="url(#arrow)"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Badge
                    className={`text-xs px-2 py-1 font-medium shadow-sm transition-all duration-200 ${getRelationTypeColor()} ${
                      isHovered ? 'scale-110 shadow-md' : ''
                    }`}
                  >
                    <Link className="w-3 h-3 mr-1" />
                    {getRelationTypeIcon()}
                  </Badge>
                  
                  {relationData?.sourceField && relationData?.targetField && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 bg-white/90 backdrop-blur-sm transition-all duration-200 ${
                        isHovered ? 'scale-110 shadow-md border-indigo-300' : ''
                      }`}
                    >
                      {relationData.sourceField}
                      <ArrowRight className="w-2 h-2 mx-1" />
                      {relationData.targetField}
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2">
                  <div className="font-semibold text-sm">
                    {relationData?.sourceField} → {relationData?.targetField}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Type: {relationData?.relationType?.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                  {relationData?.relationDetails && (
                    <div className="text-xs space-y-1">
                      {relationData.relationDetails.fields && relationData.relationDetails.fields.length > 0 && (
                        <div>
                          <span className="font-medium">Fields:</span> {relationData.relationDetails.fields.join(', ')}
                        </div>
                      )}
                      {relationData.relationDetails.references && relationData.relationDetails.references.length > 0 && (
                        <div>
                          <span className="font-medium">References:</span> {relationData.relationDetails.references.join(', ')}
                        </div>
                      )}
                      {relationData.relationDetails.onDelete && (
                        <div>
                          <span className="font-medium">On Delete:</span> {relationData.relationDetails.onDelete}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </EdgeLabelRenderer>
        
        {/* SVG marker definition */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="3"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="m0,0 l0,6 l9,3 l0,-9 z" fill={isHovered ? '#4f46e5' : '#6366f1'} />
          </marker>
        </defs>
      </>
    </TooltipProvider>
  );
});

FieldRelationshipEdge.displayName = 'FieldRelationshipEdge';
