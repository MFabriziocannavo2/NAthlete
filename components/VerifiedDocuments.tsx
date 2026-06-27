"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import SectionCard from "@/components/ui/SectionCard";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import {
  deleteDocument,
  getDocumentUrl,
  listDocuments,
  uploadDocument,
} from "@/lib/documents";
import { DOCUMENT_TYPES, type VerifiedDocument } from "@/lib/types";

export default function VerifiedDocuments({
  athleteId,
  isOwner = false,
}: {
  athleteId: string;
  isOwner?: boolean;
}) {
  const [documents, setDocuments] = useState<VerifiedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [docType, setDocType] = useState<string>(DOCUMENT_TYPES[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listDocuments(athleteId).then(({ data, error }) => {
      setDocuments(data);
      setLoadError(error);
      setLoading(false);
    });
  }, [athleteId]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    const { document, error: uploadError } = await uploadDocument(athleteId, docType, file);

    if (uploadError) {
      setError(uploadError);
    } else if (document) {
      setDocuments((prev) => [document, ...prev]);
    }

    setUploading(false);
  };

  const handleView = async (doc: VerifiedDocument) => {
    const url = await getDocumentUrl(doc.file_path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (doc: VerifiedDocument) => {
    const ok = await deleteDocument(doc);
    if (ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    }
  };

  if (loading) return (
    <SectionCard title="Verified Documents" icon={<DocumentTextIcon className="w-5 h-5 text-orange-400" />}>
      <div className="space-y-3">
        <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 bg-white/5 rounded-lg animate-pulse w-2/3" />
      </div>
    </SectionCard>
  );

  return (
    <SectionCard
      title="Verified Documents"
      icon={<DocumentTextIcon className="w-5 h-5 text-orange-400" />}
    >
      {loadError ? (
        <p className="text-red-400 text-sm mb-4">
          Couldn&apos;t load documents. Please refresh the page to try again.
        </p>
      ) : documents.length === 0 ? (
        <p className="text-gray-400 text-sm mb-4">No documents uploaded yet.</p>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-amber-400" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{doc.document_type}</p>
                  <p className="text-sm text-gray-400 truncate">{doc.file_name}</p>
                  {doc.uploaded_at && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleView(doc)}
                  className="text-gray-400 hover:text-orange-300 transition"
                  aria-label="View document"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    className="text-gray-400 hover:text-red-400 transition"
                    aria-label="Delete document"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="sm:max-w-xs"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
            onChange={handleFile}
          />

          <Button
            type="button"
            variant="secondary"
            className="px-4 py-2"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </SectionCard>
  );
}
