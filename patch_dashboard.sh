#!/bin/bash
awk '
/Pockets Visualization/ {
  print "          {/* Navigation Links */}"
  print "          <motion.div"
  print "            initial={{ opacity: 0, y: 20 }}"
  print "            animate={{ opacity: 1, y: 0 }}"
  print "            transition={{ duration: 0.6, delay: 0.05, ease: \"easeOut\" }}"
  print "            className=\"flex gap-4\""
  print "          >"
  print "            <Link href=\"/dashboard/explore\" className=\"px-6 py-3 bg-white/60 border border-white hover:bg-white text-deep-slate rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2\">"
  print "              Explore Protocol ↗"
  print "            </Link>"
  print "          </motion.div>"
  print ""
}
{print}
' src/components/dashboard/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/dashboard/Dashboard.tsx
