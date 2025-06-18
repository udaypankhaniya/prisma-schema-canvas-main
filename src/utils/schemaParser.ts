import { Node, Edge } from '@xyflow/react';

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
  [key: string]: unknown;
}

interface RelationInfo {
  sourceModel: string;
  targetModel: string;
  sourceField: string;
  targetField?: string;
  relationType: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  relationDetails?: {
    fields: string[];
    references: string[];
    onDelete?: string;
    onUpdate?: string;
  };
}

interface EnumInfo {
  name: string;
  values: string[];
}

export const parsePrismaSchema = (schemaContent: string): { nodes: Node<ModelNodeData>[], edges: Edge[], enums: EnumInfo[] } => {
  const lines = schemaContent.split('\n').map(line => line.trim());
  const models: Node<ModelNodeData>[] = [];
  const relations: RelationInfo[] = [];
  const enums: EnumInfo[] = [];
  let currentModel: { name: string; fields: Field[] } | null = null;
  let currentEnum: { name: string; values: string[] } | null = null;
  let insideModel = false;
  let insideEnum = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines and comments
    if (!line || line.startsWith('//') || line.startsWith('generator') || 
        line.startsWith('datasource')) {
      continue;
    }

    // Start of enum definition
    if (line.startsWith('enum ')) {
      const enumName = line.replace('enum ', '').replace('{', '').trim();
      currentEnum = {
        name: enumName,
        values: []
      };
      insideEnum = true;
      continue;
    }

    // Start of model definition
    if (line.startsWith('model ')) {
      const modelName = line.replace('model ', '').replace('{', '').trim();
      currentModel = {
        name: modelName,
        fields: []
      };
      insideModel = true;
      continue;
    }

    // End of model or enum definition
    if (line === '}') {
      if (insideModel && currentModel) {
        models.push({
          id: currentModel.name,
          type: 'model',
          position: {
            x: (models.length % 4) * 350 + 100,
            y: Math.floor(models.length / 4) * 300 + 100
          },
          data: currentModel
        });
        currentModel = null;
        insideModel = false;
      }
      if (insideEnum && currentEnum) {
        enums.push(currentEnum);
        currentEnum = null;
        insideEnum = false;
      }
      continue;
    }

    // Enum value inside enum
    if (insideEnum && currentEnum && line) {
      currentEnum.values.push(line);
      continue;
    }

    // Field definition inside model
    if (insideModel && currentModel && line) {
      const field = parseField(line, currentModel.name);
      if (field) {
        currentModel.fields.push(field);
        
        // Extract relation information
        if (field.isRelation && field.relationTo) {
          const relationInfo = extractRelationInfo(field, line, currentModel.name);
          relations.push(relationInfo);
        }
      }
    }
  }

  // Create field-level edges from relations
  const edges = createFieldLevelEdges(relations, models);

  return { nodes: models, edges, enums };
};

const parseField = (line: string, modelName: string): Field | null => {
  // Parse field line: "fieldName Type @modifier1 @modifier2"
  const parts = line.split(/\s+/);
  if (parts.length < 2) return null;

  const fieldName = parts[0];
  const fieldType = parts[1];
  const modifiers: string[] = [];

  // Extract modifiers but handle @relation specially
  for (let i = 2; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('@relation(')) {
      // Find the complete @relation(...) including nested parentheses
      let relationText = part;
      let openParens = (part.match(/\(/g) || []).length;
      let closeParens = (part.match(/\)/g) || []).length;
      
      while (openParens > closeParens && i + 1 < parts.length) {
        i++;
        relationText += ' ' + parts[i];
        openParens += (parts[i].match(/\(/g) || []).length;
        closeParens += (parts[i].match(/\)/g) || []).length;
      }
      
      modifiers.push(relationText);
    } else if (part.startsWith('@') || part === '?') {
      modifiers.push(part);
    }
  }

  // Check if this is a relation field
  const isRelation = line.includes('@relation') || isModelType(fieldType);
  let relationTo: string | undefined;

  if (isRelation) {
    // Extract the target model from the field type
    relationTo = fieldType.replace('[]', '').replace('?', '');
  }

  return {
    name: fieldName,
    type: fieldType,
    modifiers,
    isRelation,
    relationTo
  };
};

const isModelType = (type: string): boolean => {
  // Check if the type starts with an uppercase letter (convention for model types)
  // and is not a basic Prisma type
  const basicTypes = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Bytes'];
  const cleanType = type.replace('[]', '').replace('?', '');
  return !basicTypes.includes(cleanType) && /^[A-Z]/.test(cleanType);
};

const extractRelationInfo = (field: Field, line: string, modelName: string): RelationInfo => {
  const relationType = determineRelationType(field, line);
  const relationDetails = parseRelationAnnotation(line);
  
  // Try to find the corresponding field in the target model
  const targetField = findCorrespondingField(field, modelName, relationDetails);

  return {
    sourceModel: modelName,
    targetModel: field.relationTo!,
    sourceField: field.name,
    targetField,
    relationType,
    relationDetails
  };
};

const determineRelationType = (field: Field, line: string): 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany' => {
  const isArray = field.type.includes('[]');
  const isOptional = field.type.includes('?') || field.modifiers.includes('?');
  
  // If it's an array, it's likely one-to-many from this side
  if (isArray) {
    return 'oneToMany';
  }
  
  // If it has @relation annotation, parse it for more details
  if (line.includes('@relation')) {
    // This is likely the "owning" side of the relation
    return isOptional ? 'oneToOne' : 'manyToOne';
  }
  
  return 'oneToOne';
};

const parseRelationAnnotation = (line: string) => {
  const relationMatch = line.match(/@relation\(([^)]+)\)/);
  if (!relationMatch) return { fields: [], references: [] };

  const content = relationMatch[1];
  const fieldsMatch = content.match(/fields:\s*\[([^\]]+)\]/);
  const referencesMatch = content.match(/references:\s*\[([^\]]+)\]/);
  const onDeleteMatch = content.match(/onDelete:\s*(\w+)/);
  const onUpdateMatch = content.match(/onUpdate:\s*(\w+)/);

  return {
    fields: fieldsMatch ? fieldsMatch[1].split(',').map(f => f.trim().replace(/['"]/g, '')) : [],
    references: referencesMatch ? referencesMatch[1].split(',').map(r => r.trim().replace(/['"]/g, '')) : [],
    onDelete: onDeleteMatch ? onDeleteMatch[1] : undefined,
    onUpdate: onUpdateMatch ? onUpdateMatch[1] : undefined,
  };
};

const findCorrespondingField = (field: Field, modelName: string, relationDetails: any): string | undefined => {
  // This is a simplified approach - in a real implementation, you'd parse all models first
  // then find the corresponding field based on the relation type and references
  if (field.type.includes('[]')) {
    // One-to-many relation - the target likely has a singular reference back
    return modelName.toLowerCase();
  }
  
  if (relationDetails.references.length > 0) {
    // The target field is likely named after the source model
    return `${modelName.toLowerCase()}s`;
  }
  
  return undefined;
};

const createFieldLevelEdges = (relations: RelationInfo[], models: Node<ModelNodeData>[]): Edge[] => {
  const edges: Edge[] = [];
  const processedRelations = new Set<string>();

  relations.forEach((relation, index) => {
    const relationKey = `${relation.sourceModel}-${relation.targetModel}-${relation.sourceField}`;
    
    // Avoid duplicate edges
    if (processedRelations.has(relationKey)) {
      return;
    }

    const edgeColors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    const color = edgeColors[index % edgeColors.length];

    const edge: Edge = {
      id: `${relation.sourceModel}-${relation.targetModel}-${relation.sourceField}-${index}`,
      source: relation.sourceModel,
      target: relation.targetModel,
      sourceHandle: `${relation.sourceField}-source`,
      targetHandle: relation.targetField ? `${relation.targetField}-target` : undefined,
      type: 'fieldRelationship',
      animated: true,
      data: {
        sourceField: relation.sourceField,
        targetField: relation.targetField || 'id',
        relationType: relation.relationType,
        relationDetails: relation.relationDetails,
      },
      style: {
        stroke: color,
        strokeWidth: 2,
      },
    };

    edges.push(edge);
    processedRelations.add(relationKey);
  });

  return edges;
};

export const validatePrismaSchema = (schemaContent: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const lines = schemaContent.split('\n');

  // Basic validation
  if (!schemaContent.trim()) {
    errors.push('Schema content is empty');
    return { isValid: false, errors };
  }

  // Check for at least one model
  const hasModel = lines.some(line => line.trim().startsWith('model '));
  if (!hasModel) {
    errors.push('No models found in schema');
  }

  // Check for unclosed braces
  const openBraces = (schemaContent.match(/{/g) || []).length;
  const closeBraces = (schemaContent.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Mismatched braces in schema');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
