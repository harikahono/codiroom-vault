import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, Upload, Check, FileText } from 'lucide-react';
import { useVault } from '@/store/useVault';
import { copySaveCodeToClipboard, downloadSaveCodeAsFile, readSaveCodeFromFile } from '@/lib/savecode';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveModal({ isOpen, onClose }: SaveModalProps) {
  const { exportSaveCode, importSaveCode } = useVault();
  const [saveCode, setSaveCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate save code when tab switches to export
  const handleTabChange = (tab: 'export' | 'import') => {
    setActiveTab(tab);
    if (tab === 'export') {
      setSaveCode(exportSaveCode());
    }
  };

  const handleCopy = async () => {
    if (!saveCode) return;
    const success = await copySaveCodeToClipboard(saveCode);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!saveCode) return;
    downloadSaveCodeAsFile(saveCode);
    toast.success('File downloaded!');
  };

  const handleImport = () => {
    if (!importCode.trim()) {
      toast.error('Please enter a save code');
      return;
    }
    const success = importSaveCode(importCode.trim());
    if (success) {
      toast.success('Vault imported successfully!');
      setImportCode('');
      onClose();
    } else {
      toast.error('Invalid save code');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const code = await readSaveCodeFromFile(file);
      const success = importSaveCode(code);
      if (success) {
        toast.success('Vault imported from file!');
        onClose();
      } else {
        toast.error('Invalid save code in file');
      }
    } catch (error) {
      toast.error('Failed to read file');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="relative bg-white border-[6px] border-black w-full max-w-lg"
            style={{ boxShadow: '16px 16px 0 0 rgba(62, 2, 75, 0.5)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-[4px] border-black bg-[hsl(289,96%,15%)]">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-white" />
                <h2 className="font-display font-bold text-white">SAVE & BACKUP</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b-[4px] border-black">
              <button
                onClick={() => handleTabChange('export')}
                className={`flex-1 py-3 font-display text-sm font-bold ${
                  activeTab === 'export'
                    ? 'bg-[hsl(289,96%,15%)] text-white'
                    : 'bg-[hsl(300,14%,94%)] text-[hsl(300,20%,40%)]'
                }`}
              >
                EXPORT
              </button>
              <button
                onClick={() => handleTabChange('import')}
                className={`flex-1 py-3 font-display text-sm font-bold ${
                  activeTab === 'import'
                    ? 'bg-[hsl(289,96%,15%)] text-white'
                    : 'bg-[hsl(300,14%,94%)] text-[hsl(300,20%,40%)]'
                }`}
              >
                IMPORT
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'export' ? (
                <div className="space-y-4">
                  <p className="text-sm text-[hsl(300,20%,30%)]">
                    Copy this save code and share it via WhatsApp, or download as a file for backup.
                  </p>

                  {/* Save Code Display */}
                  <div className="relative">
                    <textarea
                      value={saveCode || exportSaveCode()}
                      readOnly
                      className="brutal-input w-full min-h-[120px] font-mono text-xs resize-none bg-[hsl(300,14%,94%)]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCopy}
                      className="flex-1 brutal-btn-primary flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          COPIED!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          COPY
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="flex-1 brutal-btn border-[4px] border-black flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD
                    </Button>
                  </div>

                  <div className="bg-yellow-50 border-[3px] border-yellow-400 p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Tip:</strong> Save your code regularly and share it to your WhatsApp group as backup. Each save generates a new code.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-[hsl(300,20%,30%)]">
                    Paste a save code to restore your vault, or upload a backup file.
                  </p>

                  {/* Paste Code */}
                  <div>
                    <label className="block font-display text-xs uppercase tracking-wide text-[hsl(289,96%,15%)] mb-2">
                      Paste Save Code
                    </label>
                    <textarea
                      value={importCode}
                      onChange={(e) => setImportCode(e.target.value)}
                      placeholder="Paste save code here..."
                      className="brutal-input w-full min-h-[100px] font-mono text-xs resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={!importCode.trim()}
                    className="w-full brutal-btn-primary"
                  >
                    IMPORT FROM CODE
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-[2px] bg-[hsl(300,14%,90%)]" />
                    <span className="text-xs text-[hsl(300,20%,40%)]">OR</span>
                    <div className="flex-1 h-[2px] bg-[hsl(300,14%,90%)]" />
                  </div>

                  {/* File Upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full brutal-btn border-[4px] border-black flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    UPLOAD BACKUP FILE
                  </Button>

                  <div className="bg-red-50 border-[3px] border-red-400 p-3">
                    <p className="text-xs text-red-800">
                      <strong>Warning:</strong> Importing will replace your current vault data. Make sure to backup first!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
