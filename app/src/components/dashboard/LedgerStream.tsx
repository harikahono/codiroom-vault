import { motion } from 'framer-motion';
import { History, ArrowUpCircle, ArrowDownCircle, XCircle, UserX } from 'lucide-react';
import { formatIDR, formatDateTime } from '@/lib/format';
import type { Log, Member } from '@/types/vault';

interface LedgerStreamProps {
  logs: Log[];
  members: Member[];
  onLogClick: (log: Log) => void;
}

const typeConfig = {
  INJECTION: {
    icon: ArrowUpCircle,
    badgeClass: 'brutal-badge-injection',
    label: 'INJECTION',
  },
  EXPENSE: {
    icon: ArrowDownCircle,
    badgeClass: 'brutal-badge-expense',
    label: 'EXPENSE',
  },
  VOID: {
    icon: XCircle,
    badgeClass: 'brutal-badge-void',
    label: 'VOID',
  },
  DECOMMISSION: {
    icon: UserX,
    badgeClass: 'brutal-badge-decommission',
    label: 'DECOMMISSION',
  },
};

export function LedgerStream({ logs, members, onLogClick }: LedgerStreamProps) {
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return null;
    const member = members.find((m) => m.id === memberId);
    return member?.name || 'Unknown';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="brutal-card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[hsl(289,96%,15%)]">
          Transaction History
        </h3>
        <div className="flex items-center gap-2 text-sm text-[hsl(300,20%,40%)]">
          <History className="w-4 h-4" />
          <span>{logs.length} entries</span>
        </div>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="text-center py-8 text-[hsl(300,20%,40%)]">
          <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No transactions yet</p>
          <p className="text-xs mt-1">Add injections or expenses to see them here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-auto">
          {sortedLogs.map((log, index) => {
            const config = typeConfig[log.type];
            const Icon = config.icon;
            const memberName = getMemberName(log.memberId);

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onLogClick(log)}
                className="flex items-center gap-3 p-3 bg-white border-[3px] border-black cursor-pointer hover:shadow-[3px_3px_0_0_rgba(62,2,75,0.2)] transition-shadow"
              >
                {/* Icon */}
                <div className={`w-10 h-10 flex items-center justify-center ${
                  log.type === 'INJECTION' ? 'bg-green-100' :
                  log.type === 'EXPENSE' ? 'bg-red-100' :
                  log.type === 'VOID' ? 'bg-gray-100' :
                  'bg-purple-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    log.type === 'INJECTION' ? 'text-green-600' :
                    log.type === 'EXPENSE' ? 'text-[hsl(351,70%,61%)]' :
                    log.type === 'VOID' ? 'text-gray-600' :
                    'text-[hsl(289,96%,15%)]'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`brutal-badge text-[10px] ${config.badgeClass}`}>
                      {config.label}
                    </span>
                    {memberName && (
                      <span className="text-xs text-[hsl(300,20%,40%)]">
                        → {memberName}
                      </span>
                    )}
                    {!log.memberId && log.type === 'EXPENSE' && log.participantCount > 0 && (
                      <span className="text-xs text-[hsl(300,20%,40%)]">
                        → Shared ({log.participantCount})
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[hsl(289,96%,15%)] truncate mt-1">
                    {log.context}
                  </p>
                  <p className="text-xs text-[hsl(300,20%,40%)]">
                    {formatDateTime(log.timestamp)}
                  </p>
                </div>

                {/* Value */}
                <div className="text-right">
                  <p className={`font-display font-bold ${
                    log.value > 0 ? 'text-green-600' :
                    log.value < 0 ? 'text-[hsl(351,70%,61%)]' :
                    'text-gray-500'
                  }`}>
                    {log.value > 0 && '+'}
                    {log.value !== 0 ? formatIDR(log.value) : '-'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
