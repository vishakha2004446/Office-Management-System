import { useState, useEffect } from "react";

// ── icon ──────────────────────────────────────────────────────────────────────
const Svg = ({ d }) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    clear: "M6 18L18 6M6 6l12 12",
};

// ── notification search ───────────────────────────────────────────────────────
const NotificationSearch = ({ searchTerm, onSearch }) => {
    const [input, setInput] = useState(searchTerm || "");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(input);
        }, 300);

        return () => clearTimeout(timer);
    }, [input, onSearch]);

    const handleClear = () => {
        setInput("");
        onSearch("");
    };

    return (
        <div className="relative">
            <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Svg d={ICONS.search} />
                </span>
                <input
                    type="text"
                    placeholder="Search notifications..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {input && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Svg d={ICONS.clear} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationSearch;
