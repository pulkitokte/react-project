import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ label = "Back" }) {
  const navigate = useNavigate();

  return (
    <div className="mt-10 mb-5 w-full ">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-[#f39c12] transition duration-200"
      >
        <ArrowLeft size={18} />
        {label}
      </button>
    </div>
  );
}
