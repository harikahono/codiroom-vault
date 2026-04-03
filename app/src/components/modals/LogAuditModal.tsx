import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpCircle, ArrowDownCircle, XCircle, UserX, Trash2, AlertTriangle } from 'lucide-react';
import { formatIDR, formatDateTime } from '@/lib/format';
import type { Log, Project } from '@/types/vault';
import { useVault } from '@/store/useVault';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface LogAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: Log;
  project: Project;
}

const typeConfig = {
  INJECTION: {
    icon: ArrowUpCircle,
    label: 'FUND INJECTION',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  EXPENSE: {
    icon: ArrowDownCircle,
    label: 'EXPENSE',
    color: 'text-[hsl(351,70%,61%)]',
    bgColor: 'bg-red-100',
  },
  VOID: {
    icon: XCircle,
    label: 'VOIDED TRANSACTION',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  DECOMMISSION: {
    icon: UserX,
    label: 'MEMBER DECOMMISSION',
    color: 'text-[hsl(289,96%,15%)]',
    bgColor: 'bg-purple-100',
  },
};

export function LogAuditModal({ isOpen, onClose, log, project }: LogAuditModalProps) {
  const { deleteLog } = useVault();
  const config = typeConfig[log.type];
  const Icon = config.icon;

  const member = log.memberId ? project.members.find((m) => m.id === log.memberId) : null;

  const handleVoid = () => {
    deleteLog(project.id, log.id);
    toast.success('Transaction voided successfully');
    onClose();
  };

  const canVoid = log.type !== 'VOID';

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
                <h2 className="font-display font-bold text-white">TRANSACTION DETAIL</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Type Badge */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${config.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div>
                  <span className={`brutal-badge ${
                    log.type === 'INJECTION' ? 'brutal-badge-injection' :
                    log.type === 'EXPENSE' ? 'brutal-badge-expense' :
                    log.type === 'VOID' ? 'brutal-badge-void' :
                    'brutal-badge-decommission'
                  }`}>
                    {config.label}
                  </span>
                  <p className="text-xs text-[hsl(300,20%,40%)] mt-1">
                    {formatDateTime(log.timestamp)}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Amount */}
                <div className="bg-[hsl(300,14%,94%)] border-[3px] border-black p-4">
                  <p className="font-display text-xs uppercase tracking-wide text-[hsl(300,20%,40%)] mb-1">
                    Amount
                  </p>
                  <p className={`font-display text-3xl font-bold ${
                    log.value > 0 ? 'text-green-600' :
                    log.value < 0 ? 'text-[hsl(351,70%,61%)]' :
                    'text-gray-500'
                  }`}>
                    {log.value > 0 && '+'}
                    {log.value !== 0 ? formatIDR(log.value) : '-'}
                  </p>
                </div>

                {/* Context */}
                <div>
                  <p className="font-display text-xs uppercase tracking-wide text-[hsl(300,20%,40%)] mb-2">
                    Description
                  </p>
                  <p className="text-[hsl(289,96%,15%)] font-medium p-3 border-[3px] border-black bg-white">
                    {log.context}
                  </p>
                </div>

                {/* Member Info */}
                {member && (
                  <div>
                    <p className="font-display text-xs uppercase tracking-wide text-[hsl(300,20%,40%)] mb-2">
                      Assigned To
                    </p>
                    <div className="flex items-center gap-3 p-3 border-[3px] border-black bg-white">
                      <div className="w-8 h-8 bg-[hsl(289,96%,15%)] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[hsl(289,96%,15%)]">{member.name}</p>
                        <p className="text-xs text-[hsl(300,20%,40%)]">{member.role}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shared Expense Info */}
                {!log.memberId && log.type === 'EXPENSE' && log.participantCount > 0 && (
                  <div>
                    <p className="font-display text-xs uppercase tracking-wide text-[hsl(300,20%,40%)] mb-2">
                      Split Details
                    </p>
                    <div className="p-3 border-[3px] border-black bg-orange-50">
                      <p className="text-sm text-orange-800">
                        Shared equally among <strong>{log.participantCount} members</strong>
                      </p>
                      <p className="text-sm text-orange-800 mt-1">
                        Each member: <strong>{formatIDR(Math.abs(log.value) / log.participantCount)}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Void Warning */}
              {log.type === 'VOID' && (
                <div className="bg-gray-100 border-[3px] border-gray-400 p-3">
                  <p className="text-sm text-gray-600">
                    This transaction has been voided and its effects have been reversed.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {canVoid && (
              <div className="p-4 border-t-[4px] border-black">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full brutal-btn-danger flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      VOID TRANSACTION
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="brutal-card-lg border-[6px] border-black">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display text-xl flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        Void Transaction?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-[hsl(300,20%,30%)]">
                        This will reverse the transaction and restore the balance.
                        {log.type === 'EXPENSE' && log.memberId && (
                          <span> The assigned member's spent amount will be adjusted.</span>
                        )}
                        {log.type === 'EXPENSE' && !log.memberId && (
                          <span> All members' spent amounts will be adjusted.</span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                      <AlertDialogCancel className="brutal-btn border-[4px] border-black">
                        CANCEL
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleVoid}
                        className="brutal-btn-danger"
                      >
                        VOID
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
