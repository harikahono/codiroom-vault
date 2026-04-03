import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, User, PlusCircle, MinusCircle } from 'lucide-react';
import { useVault } from '@/store/useVault';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'project' | 'member' | 'injection' | 'expense';
}

export function ActionModal({ isOpen, onClose, type }: ActionModalProps) {
  const { activeProjectId, addProject, addMember, addInjection, addExpense, projects } = useVault();
  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('Crew');
  const [amount, setAmount] = useState('');
  const [context, setContext] = useState('');
  const [expenseType, setExpenseType] = useState<'direct' | 'shared'>('direct');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [selectAllShared, setSelectAllShared] = useState<boolean>(false);

  const handleSubmit = () => {
    switch (type) {
      case 'project':
        if (!projectName.trim()) {
          toast.error('Please enter a project name');
          return;
        }
        addProject(projectName.trim());
        toast.success('Project created!');
        setProjectName('');
        break;

      case 'member':
        if (!activeProjectId) {
          toast.error('No active project');
          return;
        }
        if (!memberName.trim()) {
          toast.error('Please enter a member name');
          return;
        }
        addMember(activeProjectId, memberName.trim(), memberRole.trim());
        toast.success('Member added!');
        setMemberName('');
        setMemberRole('Crew');
        break;

      case 'injection':
        if (!activeProjectId) {
          toast.error('No active project');
          return;
        }
        if (!amount || parseInt(amount) <= 0) {
          toast.error('Please enter a valid amount');
          return;
        }
        if (!context.trim()) {
          toast.error('Please enter a description');
          return;
        }
        addInjection(activeProjectId, parseInt(amount), context.trim());
        toast.success('Funds injected!');
        setAmount('');
        setContext('');
        break;

      case 'expense':
        if (!activeProjectId) {
          toast.error('No active project');
          return;
        }
        if (!activeProject || activeProject.members.length === 0) {
          toast.error('No members in project — add members before recording expenses');
          return;
        }
        if (!amount || parseInt(amount) <= 0) {
          toast.error('Please enter a valid amount');
          return;
        }
        if (!context.trim()) {
          toast.error('Please enter a description');
          return;
        }
        if (expenseType === 'direct' && !selectedMemberId) {
          toast.error('Please select a member');
          return;
        }
        if (expenseType === 'direct') {
          addExpense(activeProjectId, parseInt(amount), context.trim(), [selectedMemberId]);
        } else {
          // shared
          const participants = selectAllShared
            ? activeProject.members.map((m) => m.id)
            : selectedParticipantIds;
          if (!participants || participants.length === 0) {
            toast.error('Please select at least one member for shared expense');
            return;
          }
          addExpense(activeProjectId, parseInt(amount), context.trim(), participants);
        }
        toast.success('Expense recorded!');
        setAmount('');
        setContext('');
        setSelectedMemberId('');
        setSelectedParticipantIds([]);
        setSelectAllShared(false);
        break;
    }
    onClose();
  };

  const titles = {
    project: 'Create New Project',
    member: 'Add Team Member',
    injection: 'Inject Funds',
    expense: 'Add Expense',
  };

  const icons = {
    project: Folder,
    member: User,
    injection: PlusCircle,
    expense: MinusCircle,
  };

  const Icon = icons[type];

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
            className="relative bg-white border-[6px] border-black w-full max-w-md"
            style={{ boxShadow: '16px 16px 0 0 rgba(62, 2, 75, 0.5)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-[4px] border-black bg-[hsl(289,96%,15%)]">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-white" />
                <h2 className="font-display font-bold text-white">{titles[type]}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Project Form */}
              {type === 'project' && (
                <div>
                  <label className="block font-display text-xs uppercase tracking-wide text-[hsl(289,96%,15%)] mb-2">
                    Project Name
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="brutal-input w-full"
                  />
                </div>
              )}

              {/* Member Form */}
              {type === 'member' && (
                <>
                  <div>
                    <label className="block font-display text-xs uppercase tracking-wide text-[hsl(289,96%,15%)] mb-2">
                      Member Name
                    </label>
                    <Input
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder="Enter member name..."
                      className="brutal-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-xs uppercase tracking-wide text-[hsl(289,96%,15%)] mb-2">
                      Role
                    </label>
                    <Input
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      placeholder="e.g. Crew, Lead, Manager..."
                      className="brutal-input w-full"
                    />
                  </div>
                </>
              )}

              {/* Injection/Expense Form */}
              {(type === 'injection' || type === 'expense') && (
                <>
                  <div>
                    <label className="block font-display text-xs uppercase tracking-wide text-[hsl(289,96%,15%)] mb-2">
                      Amount (IDR)
                    </label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount..."
                      className="brutal-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-xs uppercase tracking-wide text-[hsl(289,96%,15%)] mb-2">
                      Description
                    </label>
                    <Input
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="What is this for?"
                      className="brutal-input w-full"
                    />
                  </div>

                  {/* Expense Type Selection */}
                  {type === 'expense' && activeProject && (
                    <div>
                      <label className="block font-display text-xs uppercase tracking-wide text-[hsl(289,96%,15%)] mb-2">
                        Expense Type
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setExpenseType('direct')}
                          className={`flex-1 py-3 border-[4px] font-display text-sm ${
                            expenseType === 'direct'
                              ? 'border-[hsl(289,96%,15%)] bg-[hsl(289,96%,15%)] text-white'
                              : 'border-black bg-white text-black'
                          }`}
                        >
                          DIRECT
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseType('shared')}
                          className={`flex-1 py-3 border-[4px] font-display text-sm ${
                            expenseType === 'shared'
                              ? 'border-[hsl(289,96%,15%)] bg-[hsl(289,96%,15%)] text-white'
                              : 'border-black bg-white text-black'
                          }`}
                        >
                          SHARED
                        </button>
                      </div>

                      {/* Member Selection for Direct Expense */}
                      {expenseType === 'direct' && (
                        <div className="mt-3">
                          <label className="block font-display text-xs uppercase tracking-wide text-[hsl(289,96%,15%)] mb-2">
                            Assign To
                          </label>
                          <select
                            value={selectedMemberId}
                            onChange={(e) => setSelectedMemberId(e.target.value)}
                            className="brutal-input w-full"
                          >
                            <option value="">Select member...</option>
                            {activeProject.members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {expenseType === 'shared' && (
                        <div className="mt-3">
                          <p className="text-sm text-[hsl(300,20%,40%)] mb-2">
                            Select which members will share this expense (required).
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              id="select-all-shared"
                              type="checkbox"
                              checked={selectAllShared}
                              onChange={(e) => {
                                const on = e.target.checked;
                                setSelectAllShared(on);
                                if (on) setSelectedParticipantIds(activeProject.members.map((m) => m.id));
                                else setSelectedParticipantIds([]);
                              }}
                            />
                            <label htmlFor="select-all-shared" className="text-sm">
                              All members ({activeProject.members.length})
                            </label>
                          </div>
                          <div className="space-y-1 max-h-40 overflow-auto border p-2">
                            {activeProject.members.map((m) => (
                              <label key={m.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedParticipantIds.includes(m.id)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelectedParticipantIds((prev) =>
                                      checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                                    );
                                    if (!checked) setSelectAllShared(false);
                                  }}
                                />
                                <span className="text-sm">{m.name} ({m.role})</span>
                              </label>
                            ))}
                          </div>
                          <p className="text-xs text-[hsl(300,20%,40%)] mt-2">
                            The total will be divided equally among selected members.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t-[4px] border-black flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 brutal-btn border-[4px] border-black"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSubmit}
                className={`flex-1 brutal-btn ${
                  type === 'expense' ? 'brutal-btn-secondary' : 'brutal-btn-primary'
                }`}
              >
                {type === 'project' && 'CREATE'}
                {type === 'member' && 'ADD'}
                {type === 'injection' && 'INJECT'}
                {type === 'expense' && 'ADD EXPENSE'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
