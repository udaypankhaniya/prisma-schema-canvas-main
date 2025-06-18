
import React, { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface ImportSchemaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (schemaContent: string) => void;
}

export const ImportSchemaDialog = ({
  isOpen,
  onClose,
  onImport,
}: ImportSchemaDialogProps) => {
  const [schemaContent, setSchemaContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.prisma') && !file.name.endsWith('.txt')) {
      toast.error('Please select a .prisma or .txt file');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSchemaContent(content);
      setActiveTab('editor');
      setIsLoading(false);
      toast.success('Schema file loaded successfully');
    };

    reader.onerror = () => {
      setIsLoading(false);
      toast.error('Failed to read file');
    };

    reader.readAsText(file);
  }, []);

  const handleImport = () => {
    if (!schemaContent.trim()) {
      toast.error('Please provide schema content');
      return;
    }

    try {
      onImport(schemaContent);
      onClose();
      setSchemaContent('');
      toast.success('Schema imported successfully');
    } catch (error) {
      toast.error('Failed to import schema');
    }
  };

  const handleCancel = () => {
    onClose();
    setSchemaContent('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Import Prisma Schema
          </DialogTitle>
          <DialogDescription>
            Upload a .prisma file or paste your schema content to import models
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="gap-2">
              <Upload className="w-4 h-4" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="editor" className="gap-2">
              <FileText className="w-4 h-4" />
              Code Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <Label className="text-lg font-medium">
                  Choose a Prisma schema file
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload a .prisma or .txt file containing your schema
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".prisma,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schema-content">Prisma Schema Content</Label>
              <Textarea
                id="schema-content"
                placeholder={`Paste your Prisma schema here...

Example:
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String?
  posts Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}`}
                value={schemaContent}
                onChange={(e) => setSchemaContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Real-time preview will update as you type
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {schemaContent.trim() && (
              <span>
                {schemaContent.split('\n').length} lines, {schemaContent.length} characters
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!schemaContent.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Import Schema
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
