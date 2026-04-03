export default function RoomSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="h-52 bg-muted"></div>
      <div className="p-4">
        <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-muted rounded mb-3 w-1/2"></div>
        <div className="flex gap-1 mb-3">
          <div className="h-5 bg-muted rounded-full w-14"></div>
          <div className="h-5 bg-muted rounded-full w-12"></div>
          <div className="h-5 bg-muted rounded-full w-10"></div>
        </div>
        <div className="border-t border-border pt-3 flex justify-between items-center">
          <div className="h-5 bg-muted rounded w-20"></div>
          <div className="h-3 bg-muted rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}
