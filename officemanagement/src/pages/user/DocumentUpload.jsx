import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import API from "../../services/api";

// Icon component
const Svg = ({ d, className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    upload: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
    file: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    check: "M5 13l4 4L19 7",
    x: "M6 18L18 6M6 6l12 12",
    download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};

const DOCUMENT_TYPES = [
    { value: "resume", label: "Resume", icon: "📄" },
    { value: "id_proof", label: "ID Proof", icon: "🆔" },
    { value: "reports", label: "Reports", icon: "📊" },
];

const DocumentUpload = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState("resume");
    const [selectedFile, setSelectedFile] = useState(null);

    // Fetch documents
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await API.get("/documents/my");
            setDocuments(res.data || []);
            setError("");
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                setError("Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed.");
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("File size exceeds 5MB limit");
                return;
            }

            setSelectedFile(file);
            setError("");
        }
    };

    // Handle upload
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError("Please select a file");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("documentType", selectedType);

            const res = await API.post("/documents", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSuccess(`${selectedType.replace("_", " ")} uploaded successfully!`);
            setSelectedFile(null);
            setSelectedType("resume");
            document.getElementById("fileInput").value = "";
            
            await fetchDocuments();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.response?.data?.message || "Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    // Handle delete
    const handleDelete = async (docId) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            try {
                await API.delete(`/documents/${docId}`);
                setSuccess("Document deleted successfully");
                await fetchDocuments();
                setTimeout(() => setSuccess(""), 3000);
            } catch (err) {
                console.error("Delete error:", err);
                setError("Failed to delete document");
            }
        }
    };

    // Handle download
    const handleDownload = async (docId, fileName) => {
        try {
            const res = await API.get(`/documents/download/${docId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentChild.removeChild(link);
        } catch (err) {
            console.error("Download error:", err);
            setError("Failed to download document");
        }
    };

    // Get document status color
    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-700",
            verified: "bg-green-100 text-green-700",
            rejected: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    // Group documents by type
    const documentsByType = {};
    DOCUMENT_TYPES.forEach(type => {
        documentsByType[type.value] = documents.filter(doc => doc.documentType === type.value);
    });

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Document Management</h2>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
                            <span>{error}</span>
                            <button
                                onClick={() => setError("")}
                                className="text-red-700 hover:text-red-900"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex justify-between items-center">
                            <span>{success}</span>
                            <button
                                onClick={() => setSuccess("")}
                                className="text-green-700 hover:text-green-900"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Upload Form */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Document</h3>

                                    <form onSubmit={handleUpload} className="space-y-4">
                                        {/* Document Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Document Type
                                            </label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {DOCUMENT_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.icon} {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* File Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select File
                                            </label>
                                            <input
                                                id="fileInput"
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Max 5MB • Allowed: PDF, DOC, DOCX, JPG, PNG
                                            </p>
                                        </div>

                                        {/* Selected File Info */}
                                        {selectedFile && (
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm text-blue-700 font-medium">
                                                    📎 {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-blue-600 mt-1">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        <button
                                            type="submit"
                                            disabled={!selectedFile || uploading}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Svg d={ICONS.upload} className="w-4 h-4" />
                                            {uploading ? "Uploading..." : "Upload"}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Documents List */}
                            <div className="lg:col-span-2 space-y-4">
                                {DOCUMENT_TYPES.map(docType => (
                                    <div key={docType.value} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            {docType.icon} {docType.label}
                                        </h3>

                                        {documentsByType[docType.value].length === 0 ? (
                                            <p className="text-gray-500 text-sm">No documents uploaded yet</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {documentsByType[docType.value].map(doc => (
                                                    <div key={doc._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-gray-800 truncate">
                                                                    {doc.fileName}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    📦 {(doc.fileSize / 1024).toFixed(2)} KB
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    📅 {new Date(doc.uploadedAt).toLocaleDateString()}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                                                        {doc.status === "pending" && "⏳ Pending Verification"}
                                                                        {doc.status === "verified" && "✅ Verified"}
                                                                        {doc.status === "rejected" && "❌ Rejected"}
                                                                    </span>
                                                                </div>
                                                                {doc.adminComment && (
                                                                    <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                                                                        💬 {doc.adminComment}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleDownload(doc._id, doc.fileName)}
                                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                    title="Download"
                                                                >
                                                                    <Svg d={ICONS.download} className="w-5 h-5" />
                                                                </button>
                                                                {doc.status === "pending" && (
                                                                    <button
                                                                        onClick={() => handleDelete(doc._id)}
                                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                        title="Delete"
                                                                    >
                                                                        <Svg d={ICONS.trash} className="w-5 h-5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;
