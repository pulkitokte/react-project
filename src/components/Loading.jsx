import React from "react";
import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-yellow-500">
      <Loader className="animate-spin w-8 h-8 mb-2" />
      <p>Loading...</p>
    </div>
  );
}
