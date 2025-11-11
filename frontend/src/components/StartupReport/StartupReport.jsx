import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ExecutiveOverview from "./pages/ExecutiveOverview";
import MarketCompetition from "./pages/MarketCompetition";
import ProductValidation from "./pages/ProductValidation";
import Financials from "./pages/Financials";
import Recommendations from "./pages/Recommendations";

// ✅ ExportPDFButton removed completely
import ShareButton from "./actions/ShareButton";
import RegenerateButton from "./actions/RegenerateButton";
import logo from "../../assets/ideafy_logo-removebg-preview.png";
import { BarChart3, Users, CheckCircle2, Coins, Lightbulb, Book, Menu } from "lucide-react";
import axios from "axios";
import BusinessTermsSaaS from "./pages/BusinessTermsSaaS";

export default function StartupReport() {
  const location = useLocation();
  const { idea } = location.state || {};
  const [activePage, setActivePage] = useState("Executive Overview");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Executive Overview", icon: BarChart3 },
    { name: "Market & Competition", icon: Users },
    { name: "Product Validation", icon: CheckCircle2 },
    { name: "Financials", icon: Coins },
    { name: "Recommendations", icon: Lightbulb },
    { name: "Business Terms Reference", icon: Book },
  ];

  useEffect(() => {
    if (!idea) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          "https://ideafy-ai-startup-validator-backend.onrender.com/api/validate-startup",
          idea
        );
        setReportData(res.data);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        alert("Something went wrong while fetching the report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [idea]);

  const renderPage = () => {
    if (!reportData) return <p>Loading report...</p>;

    switch (activePage) {
      case "Executive Overview":
        return <ExecutiveOverview data={reportData.executiveOverview} />;
      case "Market & Competition":
        return <MarketCompetition data={reportData.marketCompetition} />;
      case "Product Validation":
        return <ProductValidation data={reportData.productValidation} />;
      case "Financials":
        return <Financials data={reportData.financials} />;
      case "Recommendations":
        return <Recommendations data={reportData.recommendations} />;
      case "Business Terms Reference":
        return <BusinessTermsSaaS />;
      default:
        return <ExecutiveOverview data={reportData.executiveOverview} />;
    }
  };

  return (
    <div className="h-screen flex bg-neutral-950 text-gray-200">
      {/* Sidebar Overlay for Mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="p-6 flex items-center space-x-2 border-b border-neutral-800">
          <img src={logo} alt="Ideafy Logo" className="h-10 w-10 object-contain drop-shadow-lg" />
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Ideafy
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setActivePage(name)}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                activePage === name
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-gray-400 hover:bg-neutral-800 hover:text-gray-200"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate whitespace-nowrap text-sm">{name}</span>
            </button>
          ))}
        </nav>

        {/* ✅ Export PDF button removed here */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          <ShareButton onClick={() => alert("Share link generated")} />
          <RegenerateButton onClick={() => alert("Regenerating with Gemini...")} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Menu Button */}
        <div className="md:hidden mb-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 bg-neutral-900 rounded-md">
            <Menu className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          <div
            ref={reportRef}
            className="bg-neutral-900 border border-neutral-800 shadow-lg rounded-xl p-6 transition-all hover:shadow-purple-500/20"
          >
            {loading ? <p>Loading report...</p> : renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
}
