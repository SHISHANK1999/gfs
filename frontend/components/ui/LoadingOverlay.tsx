export default function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />

        {/* Text */}
        <p className="mt-4 text-sm text-gray-600">
          {text || "Please wait..."}
        </p>
      </div>
    </div>
  );
}
