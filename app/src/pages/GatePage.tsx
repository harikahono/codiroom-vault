import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, Plus, Database } from 'lucide-react';
import { useVault } from '@/store/useVault';
import { readSaveCodeFromFile } from '@/lib/savecode';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function GatePage() {
  const navigate = useNavigate();
  const [saveCode, setSaveCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { projects, importSaveCode, addProject } = useVault();

  // Auto-redirect if vault exists
  useEffect(() => {
    if (projects.length > 0) {
      navigate('/vault');
    }
  }, [projects.length, navigate]);

  const handleLoadFromCode = () => {
    if (!saveCode.trim()) {
      toast.error('Please enter a save code');
      return;
    }

    setIsLoading(true);
    const success = importSaveCode(saveCode.trim());
    
    if (success) {
      toast.success('Vault loaded successfully!');
      navigate('/vault');
    } else {
      toast.error('Invalid save code. Please check and try again.');
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const code = await readSaveCodeFromFile(file);
      const success = importSaveCode(code);
      
      if (success) {
        toast.success('Vault loaded from file!');
        navigate('/vault');
      } else {
        toast.error('Invalid save code in file.');
      }
    } catch (error) {
      toast.error('Failed to read file.');
    }
    setIsLoading(false);
  };

  const handleCreateNew = () => {
    // Create a default project
    addProject('My First Project');
    toast.success('New vault created!');
    navigate('/vault');
  };

  return (
    <div className="min-h-screen bg-[hsl(300,14%,97%)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-display text-5xl md:text-6xl font-extrabold text-[hsl(289,96%,15%)] mb-2 tracking-tight"
          >
            CODIROOM
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-display text-2xl md:text-3xl font-bold text-[hsl(351,70%,61%)] tracking-wide"
          >
            VAULT v3
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[hsl(300,20%,30%)] mt-4 font-body"
          >
            Internal Expense Tracker — Zero Backend, Full Control
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="brutal-card-lg p-8"
        >
          {/* Load from Code */}
          <div className="mb-8">
            <label className="block font-display text-sm font-bold uppercase tracking-wide text-[hsl(289,96%,15%)] mb-3">
              Load from Save Code
            </label>
            <div className="flex gap-3">
              <textarea
                value={saveCode}
                onChange={(e) => setSaveCode(e.target.value)}
                placeholder="Paste your save code here..."
                className="brutal-input flex-1 min-h-[100px] resize-none font-mono text-sm"
              />
            </div>
            <Button
              onClick={handleLoadFromCode}
              disabled={isLoading || !saveCode.trim()}
              className="brutal-btn-primary w-full mt-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  LOAD VAULT
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-[3px] bg-black" />
            <span className="font-display text-sm font-bold text-[hsl(300,20%,30%)]">OR</span>
            <div className="flex-1 h-[3px] bg-black" />
          </div>

          {/* Load from File */}
          <div className="mb-8">
            <label className="block font-display text-sm font-bold uppercase tracking-wide text-[hsl(289,96%,15%)] mb-3">
              Import from File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              variant="outline"
              className="brutal-btn w-full flex items-center justify-center gap-2 border-[4px] border-black"
            >
              <Upload className="w-4 h-4" />
              UPLOAD .TXT FILE
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-[3px] bg-black" />
            <span className="font-display text-sm font-bold text-[hsl(300,20%,30%)]">OR</span>
            <div className="flex-1 h-[3px] bg-black" />
          </div>

          {/* Create New */}
          <Button
            onClick={handleCreateNew}
            className="brutal-btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            CREATE NEW VAULT
          </Button>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-[hsl(300,20%,30%)]">
            <FileText className="w-4 h-4" />
            <span>All data stored locally in your browser</span>
          </div>
          <p className="text-xs text-[hsl(300,20%,40%)] mt-2">
            Use SAVE button to generate backup codes for WhatsApp sharing
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
