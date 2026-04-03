import { motion } from 'framer-motion';
import { PlusCircle, MinusCircle, UserPlus } from 'lucide-react';

interface CommandPanelProps {
  onInject: () => void;
  onExpense: () => void;
  onAddMember: () => void;
}

export function CommandPanel({ onInject, onExpense, onAddMember }: CommandPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="brutal-card p-4"
    >
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[hsl(289,96%,15%)] mb-4">
        Quick Actions
      </h3>

      <div className="space-y-3">
        {/* Inject Funds */}
        <div className="relative">
          <div className="absolute -right-3 -bottom-3 w-full h-full bg-black" aria-hidden />
          <div className="absolute -right-1 -bottom-1 w-full h-full bg-[hsl(289,96%,15%)] opacity-90" aria-hidden />
          <button
            onClick={onInject}
            className="relative z-10 w-full brutal-btn border-[4px] border-black flex items-center gap-3 py-4 bg-[hsl(300,14%,94%)] text-[hsl(289,96%,15%)]"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-sm border-[3px] border-black">
              <PlusCircle className="w-4 h-4 text-[hsl(289,96%,15%)]" />
            </span>
            <div className="text-left">
              <span className="block font-display text-sm">INJECT FUNDS</span>
              <span className="text-xs opacity-80">Add money to project</span>
            </div>
          </button>
        </div>

        {/* Add Expense */}
        <div className="relative">
          <div className="absolute -right-3 -bottom-3 w-full h-full bg-black" aria-hidden />
          <div className="absolute -right-1 -bottom-1 w-full h-full bg-[hsl(351,70%,61%)] opacity-95" aria-hidden />
          <button
            onClick={onExpense}
            className="relative z-10 w-full brutal-btn border-[4px] border-black flex items-center gap-3 py-4 bg-[hsl(300,14%,94%)] text-[hsl(351,70%,61%)]"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-sm border-[3px] border-black">
              <MinusCircle className="w-4 h-4 text-[hsl(351,70%,61%)]" />
            </span>
            <div className="text-left">
              <span className="block font-display text-sm">ADD EXPENSE</span>
              <span className="text-xs opacity-80">Direct or shared</span>
            </div>
          </button>
        </div>

        {/* Add Member */}
        <div className="relative">
          <div className="absolute -right-3 -bottom-3 w-full h-full bg-black" aria-hidden />
          <div className="absolute -right-1 -bottom-1 w-full h-full bg-white opacity-100" aria-hidden />
          <button
            onClick={onAddMember}
            className="relative z-10 w-full brutal-btn border-[4px] border-black flex items-center gap-3 py-4 bg-white"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-sm border-[3px] border-black">
              <UserPlus className="w-4 h-4 text-black" />
            </span>
            <div className="text-left">
              <span className="block font-display text-sm text-black">ADD MEMBER</span>
              <span className="text-xs text-[hsl(300,20%,40%)]">New team member</span>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
