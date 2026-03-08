const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = [...walk('app'), ...walk('components'), ...walk('hooks')];
let found = false;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let insideComponent = false;
    let hasReturned = false;
    let componentName = '';
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // simple heuristic for functional component start
        if (line.match(/export (default )?function [A-Z]/) || line.match(/const [A-Z]\w*\s*=\s*(\(|[^=]*=>)/)) {
            insideComponent = true;
            hasReturned = false;
            componentName = line.trim();
        }
        
        if (insideComponent) {
            // Check for early return
            if (line.match(/^\s*if\s*\(.*?\)\s*(?:return|{.*?return)/) || line.match(/^\s*return\s+/)) {
                // Not the final return (heuristic: if it's too indented or inside an if)
                if (line.includes('if') || line.match(/^\s{4,}return/)) {
                    hasReturned = true;
                }
            }
            
            // Check for hook
            if (line.match(/\suse[A-Z]\w*\(/)) {
                if (hasReturned) {
                    console.log(`\n🚨 POTENTIAL VIOLATION in ${file}:${i+1}`);
                    console.log(`Context: ${componentName}`);
                    console.log(`Hook usage: ${line.trim()}`);
                    found = true;
                }
            }
            
            // simple end of component heuristic
            if (line.startsWith('}')) {
                insideComponent = false;
                hasReturned = false;
            }
        }
    }
});

if (!found) console.log("✅ No obvious early-return -> hook violations found.");
