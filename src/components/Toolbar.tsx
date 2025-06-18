
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Download,
  Upload,
  Layout,
  Zap,
  Database,
} from 'lucide-react';

interface ToolbarProps {
  onAddModel: () => void;
  onAutoLayout: () => void;
  onExportSchema: () => void;
  onImportSchema: () => void;
}

export const Toolbar = ({
  onAddModel,
  onAutoLayout,
  onExportSchema,
  onImportSchema,
}: ToolbarProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 mr-4">
          <Database className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Prisma Schema Canvas
          </h1>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          onClick={onAddModel}
          size="sm"
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add Model
        </Button>
        
        <Button
          onClick={onAutoLayout}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Layout className="w-4 h-4" />
          Auto Layout
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          onClick={onImportSchema}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Import Schema
        </Button>
        
        <Button
          onClick={onExportSchema}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export Schema
        </Button>
        
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900"
          >
            <Zap className="w-4 h-4" />
            Generate Migration
          </Button>
        </div>
      </div>
    </div>
  );
};
