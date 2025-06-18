
import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Trash2, Database } from 'lucide-react';
import { toast } from 'sonner';

interface Field {
  name: string;
  type: string;
  modifiers: string[];
}

interface ModelNodeData {
  name: string;
  fields: Field[];
  [key: string]: unknown;
}

interface ModelSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node<ModelNodeData> | null;
  onUpdateNode: (node: Node<ModelNodeData>) => void;
}

const FIELD_TYPES = [
  'String',
  'Int',
  'Float',
  'Boolean',
  'DateTime',
  'Json',
  'Bytes',
];

// Add common enum types
const ENUM_TYPES = [
  'Role',
  'Status',
  'Priority',
  'Category',
  'Gender',
  'Plan',
  'OrderStatus',
  'PaymentStatus',
];

const COMMON_MODIFIERS = [
  '@id',
  '@unique',
  '@default(cuid())',
  '@default(now())',
  '@default(false)',
  '@default(true)',
  '@updatedAt',
  '?',
];

export const ModelSidebar = ({
  isOpen,
  onClose,
  node,
  onUpdateNode,
}: ModelSidebarProps) => {
  const [modelName, setModelName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    if (node) {
      setModelName(node.data.name);
      setFields(node.data.fields || []);
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;

    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        name: modelName,
        fields,
      },
    };

    onUpdateNode(updatedNode);
    toast.success('Model updated successfully');
    onClose();
  };

  const addField = () => {
    const newField: Field = {
      name: 'newField',
      type: 'String',
      modifiers: [],
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updatedField: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updatedField };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const toggleModifier = (fieldIndex: number, modifier: string) => {
    const newFields = [...fields];
    const field = newFields[fieldIndex];
    const hasModifier = field.modifiers.includes(modifier);
    
    if (hasModifier) {
      field.modifiers = field.modifiers.filter(m => m !== modifier);
    } else {
      field.modifiers = [...field.modifiers, modifier];
    }
    
    setFields(newFields);
  };

  // Check if a type is an enum type
  const isEnumType = (type: string) => {
    return ENUM_TYPES.includes(type) || /^[A-Z][a-zA-Z]*$/.test(type);
  };

  // Get all available types (basic types + enum types)
  const getAllTypes = () => {
    return [...FIELD_TYPES, ...ENUM_TYPES];
  };

  if (!node) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Edit Model
          </SheetTitle>
          <SheetDescription>
            Modify the model structure and field definitions. Use enum types for predefined values.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter model name"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Fields</Label>
              <Button onClick={addField} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Field
              </Button>
            </div>

            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Field Name</Label>
                            <Input
                              value={field.name}
                              onChange={(e) =>
                                updateField(index, { name: e.target.value })
                              }
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) =>
                                updateField(index, { type: value })
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <div className="px-2 py-1 text-xs font-semibold text-gray-500">Basic Types</div>
                                {FIELD_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                                <Separator className="my-1" />
                                <div className="px-2 py-1 text-xs font-semibold text-gray-500">Enum Types</div>
                                {ENUM_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">ENUM</Badge>
                                      {type}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Show enum indicator */}
                        {isEnumType(field.type) && (
                          <div className="flex items-center gap-1 text-xs text-purple-600">
                            <Badge variant="outline" className="text-xs">
                              Enum Type
                            </Badge>
                            <span>This field uses predefined values</span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => removeField(index)}
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">Modifiers</Label>
                      <div className="flex flex-wrap gap-1">
                        {COMMON_MODIFIERS.map((modifier) => (
                          <Badge
                            key={modifier}
                            variant={
                              field.modifiers.includes(modifier)
                                ? 'default'
                                : 'outline'
                            }
                            className="cursor-pointer text-xs"
                            onClick={() => toggleModifier(index, modifier)}
                          >
                            {modifier}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
