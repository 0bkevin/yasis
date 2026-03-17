const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/Dashboard.tsx', 'utf8');

if (!code.includes('import Link from "next/link"')) {
  // Ensure we place imports right after "use client" so they are at the top
  code = code.replace('"use client";', '"use client";\n\nimport Link from "next/link";\nimport { TransactionHistory } from "./TransactionHistory";');
}

fs.writeFileSync('src/components/dashboard/Dashboard.tsx', code);
