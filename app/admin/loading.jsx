export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span className="flex items-end gap-1 h-8">
        <span className="eq-bar w-1.5 h-8 rounded-sm bg-crimson" style={{ animationDelay: '0ms' }} />
        <span className="eq-bar w-1.5 h-8 rounded-sm bg-neon" style={{ animationDelay: '150ms' }} />
        <span className="eq-bar w-1.5 h-8 rounded-sm bg-crimson" style={{ animationDelay: '300ms' }} />
      </span>
    </div>
  );
}
