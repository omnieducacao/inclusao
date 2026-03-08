import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'app', '(dashboard)', 'avaliacao-diagnostica', 'AvaliacaoDiagnosticaClient.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = [
    // Expanded Flexbox
    { regex: /style=\{\{\s*display:\s*["']flex["'],\s*alignItems:\s*["']center["'],\s*gap:\s*(\d+)\s*\}\}/g, replace: 'className="omni-flex-row omni-gap-$1"' },
    { regex: /style=\{\{\s*display:\s*["']flex["'],\s*alignItems:\s*["']center["'],\s*justifyContent:\s*["']space-between["'],\s*gap:\s*(\d+)\s*\}\}/g, replace: 'className="omni-flex-between omni-gap-$1"' },
    { regex: /style=\{\{\s*display:\s*["']flex["'],\s*flexDirection:\s*["']column["'],\s*gap:\s*(\d+)\s*\}\}/g, replace: 'className="omni-flex-col omni-gap-$1"' },

    // Gap normalizer
    { regex: /omni-gap-4"/g, replace: 'omni-gap-1"' },
    { regex: /omni-gap-8"/g, replace: 'omni-gap-2"' },
    { regex: /omni-gap-12"/g, replace: 'omni-gap-3"' },
    { regex: /omni-gap-16"/g, replace: 'omni-gap-4"' },
    { regex: /omni-gap-20"/g, replace: 'omni-gap-5"' },
    { regex: /omni-gap-24"/g, replace: 'omni-gap-6"' },

    // Typography
    { regex: /style=\{\{\s*color:\s*["']var\(--text-muted\)["']\s*\}\}/g, replace: 'className="omni-text-muted"' },
    { regex: /style=\{\{\s*color:\s*["']var\(--text-secondary\)["']\s*\}\}/g, replace: 'className="omni-text-secondary"' },

    { regex: /style=\{\{\s*fontSize:\s*12,\s*color:\s*["']var\(--text-muted\)["']\s*\}\}/g, replace: 'className="omni-text-sm omni-text-muted"' },
    { regex: /style=\{\{\s*fontSize:\s*13,\s*color:\s*["']var\(--text-secondary\)["']\s*\}\}/g, replace: 'className="omni-text-sm omni-text-secondary"' },
    { regex: /style=\{\{\s*fontSize:\s*14,\s*color:\s*["']var\(--text-primary\)["']\s*\}\}/g, replace: 'className="omni-text-base omni-text-primary"' },
    { regex: /style=\{\{\s*fontSize:\s*10,\s*color:\s*["']var\(--text-muted\)["']\s*\}\}/g, replace: 'className="omni-text-xs omni-text-muted"' },

    { regex: /style=\{\{\s*margin:\s*0,\s*fontSize:\s*13,\s*opacity:\s*0\.9\s*\}\}/g, replace: 'className="omni-m-0 omni-text-sm"' },
    { regex: /style=\{\{\s*margin:\s*0,\s*fontSize:\s*18,\s*fontWeight:\s*700\s*\}\}/g, replace: 'className="omni-m-0 omni-text-xl font-bold"' },
    { regex: /style=\{\{\s*margin:\s*0,\s*fontSize:\s*16,\s*fontWeight:\s*700\s*\}\}/g, replace: 'className="omni-m-0 omni-text-lg font-bold"' },

    // Basic Blocks
    { regex: /style=\{\{\s*padding:\s*16\s*\}\}/g, replace: 'className="omni-p-4"' },
    { regex: /style=\{\{\s*padding:\s*20\s*\}\}/g, replace: 'className="omni-p-5"' },
    { regex: /style=\{\{\s*padding:\s*24\s*\}\}/g, replace: 'className="omni-p-6"' },
    { regex: /style=\{\{\s*padding:\s*40\s*\}\}/g, replace: 'className="omni-p-10"' },

    // Width
    { regex: /style=\{\{\s*width:\s*["']100%["']\s*\}\}/g, replace: 'className="w-full"' },
    { regex: /style=\{\{\s*margin:\s*0\s*\}\}/g, replace: 'className="m-0"' },
    { regex: /style=\{\{\s*marginTop:\s*16\s*\}\}/g, replace: 'className="mt-4"' },

    // Flex utilities specific cases inside client
    { regex: /style=\{\{\s*display:\s*["']flex["'],\s*flexBox:\s*["']wrap["'],\s*gap:\s*6\s*\}\}/g, replace: 'className="flex flex-wrap gap-1.5"' },
    { regex: /style=\{\{\s*display:\s*["']flex["'],\s*alignItems:\s*["']center["'],\s*gap:\s*10,\s*marginBottom:\s*8\s*\}\}/g, replace: 'className="omni-flex-row omni-gap-2.5 mb-2"' }
];

let replacedCount = 0;
replacements.forEach(({ regex, replace }) => {
    const matches = content.match(regex);
    if (matches) {
        replacedCount += matches.length;
        content = content.replace(regex, replace);
    }
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`Substituição Expandida Concluída: ${replacedCount} ocorrências limpas!`);
