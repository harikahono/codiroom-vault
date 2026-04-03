import { Save, LogOut, Download } from 'lucide-react';
import { useVault } from '@/store/useVault';
import { exportProjectPDF } from '@/lib/pdf';
import { formatDateTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSave: () => void;
}

export function Header({ onSave }: HeaderProps) {
  const { lastSavedAt, clearVault } = useVault();
  const { projects, activeProjectId } = useVault();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearVault();
    navigate('/');
  };

  return (
    <header className="bg-white border-b-[6px] border-black px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[hsl(289,96%,15%)] flex items-center justify-center">
          <span className="text-white font-display font-bold text-lg">CV</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-[hsl(289,96%,15%)] tracking-tight">
            CODIROOM VAULT
          </h1>
          {lastSavedAt && (
            <p className="text-xs text-[hsl(300,20%,40%)]">
              Last saved: {formatDateTime(lastSavedAt)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onSave}
          className="brutal-btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          SAVE
        </Button>
        <Button
          onClick={() => {
            const project = projects.find((p) => p.id === activeProjectId);
            if (!project) return;
            exportProjectPDF(project);
          }}
          className="brutal-btn flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          EXPORT PDF
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="brutal-btn border-[4px] border-black flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          EXIT
        </Button>
      </div>
    </header>
  );
}
