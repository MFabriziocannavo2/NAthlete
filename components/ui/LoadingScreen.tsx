import Navbar from "@/components/Navbar";

export default function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center gap-3 py-24 px-6 text-center">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
