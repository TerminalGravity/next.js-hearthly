import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

function generateModelDocs() {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  const models = schema.split('\nmodel ');
  const docs = models.map(model => {
    if (!model.includes('{')) return '';
    
    const [modelName, ...rest] = model.split('\n');
    const fields = rest
      .join('\n')
      .split('}')[0]
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('@@'));
      
    return `
# ${modelName}

## Fields

| Name | Type | Description |
|------|------|-------------|
${fields.map(field => {
  const [name, type, ...attributes] = field.split(/\s+/);
  return `| ${name} | ${type} | ${attributes.join(' ')} |`;
}).join('\n')}
`;
  }).filter(Boolean);

  writeFileSync(
    path.join(process.cwd(), 'docs', 'architecture', 'database-schema.md'),
    docs.join('\n\n')
  );
}

generateModelDocs(); 