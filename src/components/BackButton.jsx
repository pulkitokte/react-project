import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ label = "Back" }) { 
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#FFA41C",
                color: "#fff",
                border: "none",
                outline: "none",
                padding: "8px 14px",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "20px",
                fontSize: "16px",
            }}
        >
            <ArrowLeft size={18} />{label}
        </button>
    );
}