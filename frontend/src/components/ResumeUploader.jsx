import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  UserCheck,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ResumeUploader = ({ onUploadSuccess, onPresetSelect, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setLocalError(null);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setLocalError('Only PDF resume files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('File size exceeds 5MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setLocalError('Please choose or drag a PDF resume file.');
      return;
    }
    onUploadSuccess(selectedFile, targetRole);
  };

  return (
    <div className="space-y-6">
      {/* Upload Box Container */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-sky-400" />
              Upload Candidate Resume (PDF)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Processed 100% locally with PyMuPDF. Extracts projects, experience evidence, and canonical skills.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Role:</span>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Data Scientist"
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center gap-3 cursor-pointer text-center ${
            dragActive
              ? 'border-sky-500 bg-sky-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="hidden"
          />

          <div className="p-3.5 rounded-full bg-slate-900 border border-slate-800 text-sky-400 shadow-lg">
            <FileText className="w-6 h-6" />
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                <span className="text-sky-400">Selected:</span> {selectedFile.name}
              </div>
              <p className="text-xs text-slate-400">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready for local PyMuPDF parsing
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">
                Drag & drop your resume PDF here, or <span className="text-sky-400 underline">browse</span>
              </div>
              <p className="text-xs text-slate-500">Supports PDF format (Max 5MB)</p>
            </div>
          )}
        </div>

        {localError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {/* Upload Action Button */}
        {selectedFile && (
          <button
            onClick={handleUploadSubmit}
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Extracting Projects & Evidence with PyMuPDF...' : 'Parse & Build Candidate Evidence Graph'}
          </button>
        )}

        {/* Preset Sample Resumes for Fast Testing */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Don't have a PDF? Test with sample candidate presets:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onPresetSelect('junior-data-scientist')}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition font-medium flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                Alex Chen (Junior Data Scientist)
              </button>

              <button
                type="button"
                onClick={() => onPresetSelect('python-backend-dev')}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition font-medium flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Sarah Jenkins (Python Developer)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
