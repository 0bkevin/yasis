const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/Dashboard.tsx', 'utf8');

if (!code.includes('import Link from "next/link"')) {
  code = code.replace('import { formatUnits, erc20Abi } from "viem";', 'import Link from "next/link";\nimport { TransactionHistory } from "./TransactionHistory";\nimport { formatUnits, erc20Abi } from "viem";');
}

if (!code.includes('Explore Protocol')) {
  code = code.replace('{/* Pockets Visualization */}', `
          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
            className="flex gap-4 mb-8"
          >
            <Link href="/dashboard/explore" className="px-6 py-3 bg-white/60 border border-white hover:bg-white text-deep-slate rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2">
              Explore Protocol ↗
            </Link>
          </motion.div>

          {/* Pockets Visualization */}`);
}

if (!code.includes('<TransactionHistory />')) {
  code = code.replace('{/* Sidebar */}', `        </div>\n\n        {/* Sidebar */}`);
  code = code.replace('<div className="lg:col-span-5 space-y-6">', '<div className="lg:col-span-5 space-y-6">\n          <TransactionHistory />\n');
}

fs.writeFileSync('src/components/dashboard/Dashboard.tsx', code);
