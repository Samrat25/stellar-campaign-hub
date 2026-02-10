import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignSkeletonProps {
  viewMode?: "grid" | "list";
  count?: number;
}

export const CampaignSkeleton = ({ viewMode = "grid", count = 6 }: CampaignSkeletonProps) => {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <Card key={i} className="p-6 bg-slate-900/50 border-slate-700 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4 bg-slate-800" />
                <Skeleton className="h-4 w-1/2 bg-slate-800" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24 bg-slate-800" />
                  <Skeleton className="h-4 w-24 bg-slate-800" />
                </div>
              </div>
              <div className="w-48 space-y-2">
                <Skeleton className="h-2 w-full bg-slate-800" />
                <Skeleton className="h-3 w-20 mx-auto bg-slate-800" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 bg-slate-800" />
                <Skeleton className="h-9 w-9 bg-slate-800" />
                <Skeleton className="h-9 w-20 bg-slate-800" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="overflow-hidden bg-slate-900/50 border-slate-700 animate-pulse">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4 bg-slate-800" />
              <Skeleton className="h-4 w-20 bg-slate-800" />
            </div>
            
            <Skeleton className="h-4 w-full bg-slate-800" />
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12 bg-slate-800" />
                <Skeleton className="h-6 w-20 bg-slate-800" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-12 bg-slate-800" />
                <Skeleton className="h-6 w-20 bg-slate-800" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-2 w-full bg-slate-800" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16 bg-slate-800" />
                <Skeleton className="h-3 w-20 bg-slate-800" />
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex gap-2">
            <Skeleton className="h-9 flex-1 bg-slate-800" />
            <Skeleton className="h-9 flex-1 bg-slate-800" />
          </div>
          
          <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800">
            <Skeleton className="h-10 w-full bg-slate-800" />
          </div>
        </Card>
      ))}
    </div>
  );
};
