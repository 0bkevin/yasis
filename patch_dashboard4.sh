#!/bin/bash
sed -i '' 's/          <TransactionHistory \/>//g' src/components/dashboard/Dashboard.tsx

awk '
/<div className="lg:col-span-7 space-y-10">/ {
  print $0
  next
}
/Sidebar/ {
  print "        </div>"
  print ""
  print "        {/* Sidebar */}"
  print "        <div className=\"lg:col-span-5 space-y-6\">"
  print "          <TransactionHistory />"
  next
}
/        {/* Sidebar \*\// {
  next
}
/<div className=\"lg:col-span-5 space-y-6\">/ {
  if (found_sidebar == 0) {
     found_sidebar = 1
     next
  }
}
{print}
' src/components/dashboard/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/dashboard/Dashboard.tsx
