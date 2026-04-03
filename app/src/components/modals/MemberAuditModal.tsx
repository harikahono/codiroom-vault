import { motion, AnimatePresence } from 'framer-motion';
import { X, User, TrendingUp, FileDown, ArrowDownCircle } from 'lucide-react';
import { formatIDR, formatDateTime } from '@/lib/format';
import { exportMemberAuditPDF } from '@/lib/pdf';
import type { Member, Project, Log } from '@/types/vault';
import { Button } from '@/components/ui/button';

interface MemberAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  project: Project;
}

export function MemberAuditModal({ isOpen, onClose, member, project }: MemberAuditModalProps) {
  // Get member's transactions
  const memberLogs = project.logs.filter((l) => {
    if (l.memberId === member.id) return true;
    if (!l.memberId && l.type === 'EXPENSE') {
      // Shared expense - member was participant
      return true;
    }
    return false;
  });

  const sortedLogs = [...memberLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getTransactionAmount = (log: Log): number => {
    if (log.memberId === member.id) {
      return Math.abs(log.value);
    } else if (!log.memberId && log.type === 'EXPENSE') {
      // Shared expense split
      return Math.abs(log.value) / log.participantCount;
    }
    return 0;
  };

  const handleExportPDF = () => {
    exportMemberAuditPDF(project, member);
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
            className="relative bg-white border-[6px] border-black w-full max-w-2xl max-h-[90vh] flex flex-col"
            style={{ boxShadow: '16px 16px 0 0 rgba(62, 2, 75, 0.5)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-[4px] border-black bg-[hsl(289,96%,15%)]">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-white" />
                <h2 className="font-display font-bold text-white">MEMBER AUDIT</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Info */}
            <div className="p-6 border-b-[4px] border-black bg-[hsl(300,14%,94%)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[hsl(289,96%,15%)] flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[hsl(289,96%,15%)]">
                      {member.name}
                    </h3>
                    <span className="brutal-badge mt-2 bg-[hsl(300,14%,90%)]">
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-xs uppercase tracking-wide text-[hsl(300,20%,40%)]">
                    Total Spent
                  </p>
                  <p className="font-display text-3xl font-bold text-[hsl(351,70%,61%)]">
                    {formatIDR(member.totalSpent)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display text-sm font-bold uppercase tracking-wide text-[hsl(289,96%,15%)]">
                  Transaction History
                </h4>
                <span className="text-sm text-[hsl(300,20%,40%)]">
                  {sortedLogs.length} entries
                </span>
              </div>

              {sortedLogs.length === 0 ? (
                <div className="text-center py-8 text-[hsl(300,20%,40%)]">
                  <ArrowDownCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedLogs.map((log, index) => {
                    const amount = getTransactionAmount(log);
                    const isDirect = log.memberId === member.id;

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-3 p-3 bg-white border-[3px] border-black"
                      >
                        <div className={`w-10 h-10 flex items-center justify-center ${
                          isDirect ? 'bg-red-100' : 'bg-orange-100'
                        }`}>
                          <TrendingUp className={`w-5 h-5 ${
                            isDirect ? 'text-[hsl(351,70%,61%)]' : 'text-orange-500'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`brutal-badge text-[10px] ${
                              isDirect ? 'brutal-badge-expense' : 'bg-orange-500 text-white border-black'
                            }`}>
                              {isDirect ? 'DIRECT' : 'SHARED'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-[hsl(289,96%,15%)] truncate mt-1">
                            {log.context}
                          </p>
                          <p className="text-xs text-[hsl(300,20%,40%)]">
                            {formatDateTime(log.timestamp)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-display font-bold text-[hsl(351,70%,61%)]">
                            {formatIDR(amount)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t-[4px] border-black">
              <Button
                onClick={handleExportPDF}
                className="w-full brutal-btn-primary flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                EXPORT AS PDF
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
