import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { formatIDR } from '@/lib/format';

interface BalanceCardProps {
  balance: number;
  totalInjected: number;
  totalExpenses: number;
}

export function BalanceCard({ balance, totalInjected, totalExpenses }: BalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="brutal-card-lg p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance */}
        <div className="md:col-span-1 flex items-center gap-4">
          <div className="w-16 h-16 bg-[hsl(289,96%,15%)] flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="font-display text-xs uppercase tracking-wide text-[hsl(300,20%,40%)]">
              Current Balance
            </p>
            <p className={`font-display text-3xl font-bold ${balance >= 0 ? 'text-[hsl(289,96%,15%)]' : 'text-[hsl(336,93%,18%)]'}`}>
              {formatIDR(balance)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {/* Total Injected */}
          <div className="bg-green-50 border-[4px] border-green-600 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-display text-xs uppercase tracking-wide text-green-700">
                Total Injected
              </span>
            </div>
            <p className="font-display text-xl font-bold text-green-700">
              {formatIDR(totalInjected)}
            </p>
          </div>

          {/* Total Expenses */}
          <div className="bg-red-50 border-[4px] border-[hsl(351,70%,61%)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-[hsl(351,70%,61%)]" />
              <span className="font-display text-xs uppercase tracking-wide text-[hsl(351,70%,61%)]">
                Total Expenses
              </span>
            </div>
            <p className="font-display text-xl font-bold text-[hsl(351,70%,61%)]">
              {formatIDR(totalExpenses)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
