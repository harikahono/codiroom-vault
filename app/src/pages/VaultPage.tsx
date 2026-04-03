import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVault } from '@/store/useVault';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { MemberGrid } from '@/components/dashboard/MemberGrid';
import { LedgerStream } from '@/components/dashboard/LedgerStream';
import { CommandPanel } from '@/components/dashboard/CommandPanel';
import { ActionModal } from '@/components/modals/ActionModal';
import { MemberAuditModal } from '@/components/modals/MemberAuditModal';
import { LogAuditModal } from '@/components/modals/LogAuditModal';
import { SaveModal } from '@/components/modals/SaveModal';
import type { Member, Log } from '@/types/vault';

export function VaultPage() {
  const { projects, activeProjectId } = useVault();
  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Modal states
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'project' | 'member' | 'injection' | 'expense'>('expense');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [memberAuditOpen, setMemberAuditOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [logAuditOpen, setLogAuditOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const handleOpenAction = (type: 'project' | 'member' | 'injection' | 'expense') => {
    setActionType(type);
    setActionModalOpen(true);
  };

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setMemberAuditOpen(true);
  };

  const handleLogClick = (log: Log) => {
    setSelectedLog(log);
    setLogAuditOpen(true);
  };

  return (
    <div className="min-h-screen bg-[hsl(300,14%,97%)] flex">
      {/* Sidebar */}
      <Sidebar onAddProject={() => handleOpenAction('project')} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header onSave={() => setSaveModalOpen(true)} />

        {/* Main Area */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {!activeProject ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <div className="brutal-card p-12 text-center max-w-md">
                  <h2 className="font-display text-3xl font-bold text-[hsl(289,96%,15%)] mb-4">
                    NO PROJECT SELECTED
                  </h2>
                  <p className="text-[hsl(300,20%,30%)] mb-6">
                    Select a project from the sidebar or create a new one to get started.
                  </p>
                  <button
                    onClick={() => handleOpenAction('project')}
                    className="brutal-btn-primary px-8 py-4"
                  >
                    CREATE PROJECT
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeProject.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Project Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-display text-3xl font-bold text-[hsl(289,96%,15%)]">
                      {activeProject.name}
                    </h1>
                    <p className="text-sm text-[hsl(300,20%,30%)] mt-1">
                      {activeProject.members.length} members • {activeProject.logs.length} transactions
                    </p>
                  </div>
                </div>

                {/* Balance Card */}
                <BalanceCard
                  balance={activeProject.balance}
                  totalInjected={activeProject.logs
                    .filter((l) => l.type === 'INJECTION')
                    .reduce((sum, l) => sum + l.value, 0)}
                  totalExpenses={activeProject.logs
                    .filter((l) => l.type === 'EXPENSE')
                    .reduce((sum, l) => sum + Math.abs(l.value), 0)}
                />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Command Panel */}
                  <div className="lg:col-span-1">
                    <CommandPanel
                      onInject={() => handleOpenAction('injection')}
                      onExpense={() => handleOpenAction('expense')}
                      onAddMember={() => handleOpenAction('member')}
                    />
                  </div>

                  {/* Right: Member Grid */}
                  <div className="lg:col-span-2">
                    <MemberGrid
                      members={activeProject.members}
                      onMemberClick={handleMemberClick}
                    />
                  </div>
                </div>

                {/* Ledger Stream */}
                <LedgerStream
                  logs={activeProject.logs}
                  members={activeProject.members}
                  onLogClick={handleLogClick}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <ActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        type={actionType}
      />

      <SaveModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
      />

      {selectedMember && activeProject && (
        <MemberAuditModal
          isOpen={memberAuditOpen}
          onClose={() => setMemberAuditOpen(false)}
          member={selectedMember}
          project={activeProject}
        />
      )}

      {selectedLog && activeProject && (
        <LogAuditModal
          isOpen={logAuditOpen}
          onClose={() => setLogAuditOpen(false)}
          log={selectedLog}
          project={activeProject}
        />
      )}
    </div>
  );
}
