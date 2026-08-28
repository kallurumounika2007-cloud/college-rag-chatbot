import React, { useState, useEffect } from 'react';
import { documentAPI } from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Layers, 
  Sparkles,
  RefreshCw,
  X,
  FileCode,
  Search
} from 'lucide-react';

const DocumentManagementPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewingChunksDoc, setViewingChunksDoc] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await documentAPI.getDocuments();
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await documentAPI.uploadDocument(formData);
      setUploadSuccess(`Document "${res.data.title}" successfully processed and indexed into ChromaDB! (${res.data.chunk_count} chunks)`);
      setSelectedFile(null);
      // Reset input
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      await fetchDocs();
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload and process document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also remove all its embeddings from ChromaDB.`)) {
      return;
    }
    try {
      await documentAPI.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
      if (viewingChunksDoc?.document_id === docId) {
        setViewingChunksDoc(null);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete document');
    }
  };

  const handleViewChunks = async (doc) => {
    setViewingChunksDoc(doc);
    setLoadingChunks(true);
    try {
      const res = await documentAPI.getDocumentChunks(doc.document_id);
      setChunks(res.data);
    } catch (err) {
      console.error('Failed to fetch document chunks:', err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleSeedSamples = async () => {
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const res = await documentAPI.seedSampleDocuments();
      setUploadSuccess(res.data.message);
      await fetchDocs();
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to seed sample documents.');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    (d.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.file_type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem',
      minHeight: 'calc(100vh - 70px)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <div style={{
              padding: '0.4rem',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
            }}>
              <FileText size={20} color="#818cf8" />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Knowledge Base & Documents</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Upload, parse, chunk, and index college policies, notices, fee schedules, and academic guides
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSeedSamples}
            disabled={uploading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={14} color="#fbbf24" />
            <span>Load Sample College Documents</span>
          </button>
          <button
            onClick={fetchDocs}
            className="btn btn-ghost btn-sm btn-icon"
            title="Refresh list"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Upload Box Component */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UploadCloud size={18} color="#818cf8" />
          <span>Upload College Document to Vector Store</span>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Supported formats: <strong>PDF (.pdf)</strong>, <strong>Word (.docx)</strong>, <strong>Plain Text (.txt)</strong>.
          Documents are automatically parsed, segmented into semantic chunks, and embedded into ChromaDB.
        </p>

        {uploadError && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1rem',
          }}>
            <AlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div style={{
            background: 'var(--success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1rem',
          }}>
            <CheckCircle size={16} />
            <span>{uploadSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpload} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            flex: 1,
            minWidth: '260px',
            border: '2px dashed var(--border-active)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer',
          }}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileCode size={22} color="#818cf8" />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: selectedFile ? '#ffffff' : 'var(--text-secondary)' }}>
                  {selectedFile ? selectedFile.name : 'Click or drop PDF / DOCX / TXT file here'}
                </span>
                {selectedFile && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
            </div>

            <input
              id="file-upload-input"
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
              Browse
            </span>
          </div>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.5rem', height: '56px' }}
          >
            {uploading ? (
              <>
                <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Processing & Indexing...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Upload & Index</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Documents List & Search */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Indexed Documents ({documents.length})
          </h3>

          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem', paddingBlock: '0.45rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading document library...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'rgba(255, 255, 255, 0.01)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
          }}>
            <FileText size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No college documents indexed yet.</p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
              Upload documents above or click "Load Sample College Documents" to quickly populate the knowledge base.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Document Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Format</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Size</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Chunks</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Uploaded At</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => {
                  const uploadDate = new Date(doc.uploaded_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={doc.document_id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#ffffff' }}>
                        {doc.title}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
                          {doc.file_type?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge badge-${doc.status}`}>
                          {doc.status === 'ready' && 'Ready'}
                          {doc.status === 'processing' && 'Processing'}
                          {doc.status === 'failed' && 'Failed'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge badge-primary">
                          {doc.chunk_count} chunks
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {uploadDate}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleViewChunks(doc)}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.6rem' }}
                            title="Inspect Chunks in ChromaDB"
                          >
                            <Layers size={14} color="#818cf8" />
                            <span>Chunks</span>
                          </button>

                          <button
                            onClick={() => handleDelete(doc.document_id, doc.title)}
                            className="btn btn-ghost btn-sm btn-icon"
                            style={{ color: '#f87171' }}
                            title="Delete Document"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chunk Viewer Modal */}
      {viewingChunksDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 110,
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '780px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'rgba(30, 41, 59, 0.5)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                  {viewingChunksDoc.title} - Chunks ({chunks.length})
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ChromaDB vector embeddings segmented for semantic retrieval
                </p>
              </div>
              <button onClick={() => setViewingChunksDoc(null)} className="btn btn-ghost btn-icon">
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {loadingChunks ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading chunks from vector store...
                </div>
              ) : chunks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No chunks found for this document.
                </div>
              ) : (
                chunks.map((chk, i) => (
                  <div
                    key={chk.chunk_id || i}
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        Chunk #{chk.chunk_index} · Page {chk.page_number}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ID: {chk.chunk_id}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {chk.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <button onClick={() => setViewingChunksDoc(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagementPage;
