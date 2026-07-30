import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

// Goes back in browser history when possible (so it lands wherever the
// user actually came from), falling back to a sensible route otherwise
// (e.g. the page was opened directly via a bookmark or refresh).
export default function BackButton({ fallback = "/" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1 text-sm text-black/60 hover:text-black transition-colors mb-4"
    >
      <ArrowLeftOutlined style={{ fontSize: 12 }} /> Back
    </button>
  );
}
