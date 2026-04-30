const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src').filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
let updatedCount = 0;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    const searchStr = 'https://mess-portal-server.onrender.com';
    
    if(content.includes(searchStr)) {
        // Step 1: Replace literal URL
        content = content.replace(/https:\/\/mess-portal-server\.onrender\.com/g, "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}");
        
        // Step 2: Fix quotes -> If it was "url/api", it is now "${...}/api". Change " to `
        const regex = /"\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}([^"]*)"/g;
        content = content.replace(regex, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}$1`');
        
        fs.writeFileSync(f, content, 'utf8');
        console.log('Updated ' + f);
        updatedCount++;
    }
});

console.log('Total files updated: ' + updatedCount);
