import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'app', '(dashboard)', 'avaliacao-diagnostica', 'AvaliacaoDiagnosticaClient.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = [
    // Botoes Refazer e Regenerar Imagem
    {
        regex: /style=\{\{\s*fontSize:\s*11,\s*padding:\s*["']4px\s*10px["'],\s*borderRadius:\s*6,\s*border:\s*["']1px\s*solid\s*rgba\(245,158,11,\.25\)["'],\s*background:\s*["']rgba\(245,158,11,\.06\)["'],\s*color:\s*["']#f59e0b["'],\s*cursor:\s*["']pointer["'],\s*fontWeight:\s*600,\s*display:\s*["']flex["'],\s*alignItems:\s*["']center["'],\s*gap:\s*4,\s*\}\}/g,
        replace: 'className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border border-amber-500/25 bg-amber-500/5 text-amber-500 font-semibold cursor-pointer"'
    },
    {
        regex: /style=\{\{\s*fontSize:\s*11,\s*padding:\s*["']4px\s*10px["'],\s*borderRadius:\s*6,\s*border:\s*["']1px\s*solid\s*rgba\(99,102,241,\.2\)["'],\s*background:\s*["']rgba\(99,102,241,\.06\)["'],\s*color:\s*["']#818cf8["'],\s*cursor:\s*isRegeneratingImg\s*\?\s*["']wait["']\s*:\s*["']pointer["'],\s*fontWeight:\s*600,\s*display:\s*["']flex["'],\s*alignItems:\s*["']center["'],\s*gap:\s*4,\s*\}\}/g,
        replace: 'className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-semibold ${isRegeneratingImg ? "cursor-wait" : "cursor-pointer"}`}'
    },

    // Card Header Background
    {
        regex: /style=\{\{\s*display:\s*["']flex["'],\s*alignItems:\s*["']center["'],\s*justifyContent:\s*["']space-between["'],\s*padding:\s*["']10px\s*16px["'],\s*background:\s*isError\s*\?\s*["']rgba\(239,68,68,\.06\)["']\s*:\s*["']rgba\(99,102,241,\.04\)["'],\s*borderBottom:\s*["']1px\s*solid\s*var\(--border-default,\s*rgba\(148,163,184,\.08\)\)["'],\s*\}\}/g,
        replace: 'className={`flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-default)] ${isError ? "bg-red-500/5" : "bg-indigo-500/5"}`}'
    },

    // Número Card Circle
    {
        regex: /style=\{\{\s*width:\s*30,\s*height:\s*30,\s*borderRadius:\s*["']50%["'],\s*display:\s*["']flex["'],\s*alignItems:\s*["']center["'],\s*justifyContent:\s*["']center["'],\s*background:\s*isError\s*\?\s*["']rgba\(239,68,68,\.12\)["']\s*:\s*["']rgba\(99,102,241,\.12\)["'],\s*color:\s*isError\s*\?\s*["']#ef4444["']\s*:\s*["']#6366f1["'],\s*fontWeight:\s*800,\s*fontSize:\s*14,\s*\}\}/g,
        replace: 'className={`w-[30px] h-[30px] rounded-full flex items-center justify-center font-extrabold text-sm ${isError ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"}`}'
    },

    // Textarea Feedback
    {
        regex: /style=\{\{\s*width:\s*["']100%["'],\s*padding:\s*["']8px\s*12px["'],\s*borderRadius:\s*8,\s*border:\s*["']1px\s*solid\s*rgba\(245,158,11,\.25\)["'],\s*background:\s*["']rgba\(245,158,11,\.03\)["'],\s*fontSize:\s*13,\s*resize:\s*["']vertical["'],\s*color:\s*["']var\(--text-primary\)["'],\s*outline:\s*["']none["'],\s*\}\}/g,
        replace: 'className="w-full px-3 py-2 rounded-lg border border-amber-500/25 bg-amber-500/5 text-sm resize-y text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-amber-500/30"'
    },

    // Textarea Container
    {
        regex: /style=\{\{\s*padding:\s*["']12px\s*16px["'],\s*background:\s*["']rgba\(245,158,11,\.04\)["'],\s*borderBottom:\s*["']1px\s*solid\s*rgba\(245,158,11,\.15\)["'],\s*display:\s*["']flex["'],\s*flexDirection:\s*["']column["'],\s*gap:\s*8,\s*\}\}/g,
        replace: 'className="flex flex-col gap-2 px-4 py-3 bg-amber-500/5 border-b border-amber-500/15"'
    },

    // Button Regenerar e Cancelar no Feedback
    {
        regex: /style=\{\{\s*padding:\s*["']6px\s*14px["'],\s*borderRadius:\s*6,\s*border:\s*["']none["'],\s*background:\s*isRegenerating\s*\?\s*["']#94a3b8["']\s*:\s*["']linear-gradient\(135deg,\s*#f59e0b,\s*#fbbf24\)["'],\s*color:\s*["']#fff["'],\s*fontSize:\s*12,\s*fontWeight:\s*700,\s*cursor:\s*isRegenerating\s*\?\s*["']wait["']\s*:\s*["']pointer["'],\s*display:\s*["']flex["'],\s*alignItems:\s*["']center["'],\s*gap:\s*4,\s*\}\}/g,
        replace: 'className={`flex items-center gap-1 px-3 py-1.5 rounded-md border-none text-white text-xs font-bold ${isRegenerating ? "bg-slate-400 cursor-wait" : "bg-gradient-to-br from-amber-500 to-amber-400 cursor-pointer"}`}'
    },
    {
        regex: /style=\{\{\s*padding:\s*["']6px\s*14px["'],\s*borderRadius:\s*6,\s*border:\s*["']1px\s*solid\s*var\(--border-default,\s*rgba\(148,163,184,\.15\)\)["'],\s*background:\s*["']transparent["'],\s*color:\s*["']var\(--text-muted\)["'],\s*fontSize:\s*12,\s*cursor:\s*["']pointer["'],\s*\}\}/g,
        replace: 'className="px-3 py-1.5 rounded-md border border-[var(--border-default)] bg-transparent text-[var(--text-muted)] text-xs cursor-pointer hover:bg-slate-500/5"'
    },

    // Generic Layout items
    {
        regex: /style=\{\{\s*display:\s*["']flex["'],\s*flexDirection:\s*["']column["'],\s*gap:\s*10\s*\}\}/g,
        replace: 'className="flex flex-col gap-2.5"'
    },
    {
        regex: /style=\{\{\s*display:\s*["']flex["'],\s*gap:\s*6\s*\}\}/g,
        replace: 'className="flex gap-1.5"'
    },
    {
        regex: /style=\{\{\s*fontSize:\s*14,\s*lineHeight:\s*1\.7,\s*color:\s*["']var\(--text-primary\)["'],\s*margin:\s*0\s*\}\}/g,
        replace: 'className="text-sm leading-relaxed text-[var(--text-primary)] m-0"'
    },
    {
        regex: /style=\{\{\s*fontSize:\s*13,\s*fontWeight:\s*700,\s*color:\s*["']var\(--text-primary\)["'],\s*margin:\s*["']4px\s*0["'],\s*fontStyle:\s*["']italic["']\s*\}\}/g,
        replace: 'className="text-[13px] font-bold text-[var(--text-primary)] my-1 italic"'
    },

    // Justificativa e Instrução (Lines 2560-2580)
    {
        regex: /style=\{\{\s*marginTop:\s*6,\s*padding:\s*["']8px\s*12px["'],\s*borderRadius:\s*8,\s*background:\s*["']rgba\(99,102,241,\.04\)["'],\s*border:\s*["']1px\s*solid\s*rgba\(99,102,241,\.1\)["'],\s*fontSize:\s*12,\s*color:\s*["']var\(--text-muted\)["'],\s*fontStyle:\s*["']italic["'],\s*lineHeight:\s*1\.5,\s*\}\}/g,
        replace: 'className="mt-1.5 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-400 italic leading-snug"'
    },
    {
        regex: /style=\{\{\s*padding:\s*["']8px\s*12px["'],\s*borderRadius:\s*8,\s*background:\s*["']rgba\(245,158,11,\.04\)["'],\s*border:\s*["']1px\s*solid\s*rgba\(245,158,11,\.12\)["'],\s*fontSize:\s*12,\s*color:\s*["']#b45309["'],\s*lineHeight:\s*1\.5,\s*\}\}/g,
        replace: 'className="px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-700 leading-snug"'
    }
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
console.log(`Substituição de Estruturas Condicionais do Card Concluída: ${replacedCount} ocorrências convertidas!`);
