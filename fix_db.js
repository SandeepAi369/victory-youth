const fs = require('fs');
const files = ['src/db/index.ts', 'src/db/seed.ts'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /const client = postgres\\(.*?\\);/s,
    \const client = postgres({
      host: '***REMOVED***',
      port: 26257,
      database: 'defaultdb',
      user: '***REMOVED***',
      password: '***REMOVED***',
      ssl: 'require',
      max: 10
    });\
  );
  fs.writeFileSync(file, content);
}
console.log('Fixed DB files');
