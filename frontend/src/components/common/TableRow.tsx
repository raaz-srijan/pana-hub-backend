interface TableRowSkeletonProps {
  columnCount: number;
  rowCount?: number;
}

export const TableRowSkeleton = ({ columnCount, rowCount = 3 }: TableRowSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse bg-white/50">
          {Array.from({ length: columnCount }).map((_, cIdx) => (
            <td key={cIdx} className="py-5 px-6">
              {cIdx === 0 ? (
                // Leftmost column presents an inline image/text compound mockup
                <div className="flex items-center gap-3">
                  <div className="w-8 h-10 bg-slate-200 rounded-md shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-3 bg-slate-200 rounded-sm w-3/4" />
                    <div className="h-2.5 bg-slate-200 rounded-sm w-1/2" />
                  </div>
                </div>
              ) : cIdx === columnCount - 1 ? (
                // Action parameters fallback layout
                <div className="h-7 w-7 bg-slate-200 rounded-md ml-auto" />
              ) : (
                // Standard default data field block mockups
                <div className={`space-y-1.5 ${cIdx % 2 === 0 ? "mx-auto w-16" : "w-24"}`}>
                  <div className="h-3 bg-slate-200 rounded-sm w-full" />
                </div>
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};