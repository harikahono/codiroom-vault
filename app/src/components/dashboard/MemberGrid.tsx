import { motion } from 'framer-motion';
import { User, TrendingUp, Users } from 'lucide-react';
import { formatIDR } from '@/lib/format';
import type { Member } from '@/types/vault';

interface MemberGridProps {
  members: Member[];
  onMemberClick: (member: Member) => void;
}

export function MemberGrid({ members, onMemberClick }: MemberGridProps) {
  const totalSpent = members.reduce((sum, m) => sum + m.totalSpent, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="brutal-card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[hsl(289,96%,15%)]">
          Team Members
        </h3>
        <div className="flex items-center gap-2 text-sm text-[hsl(300,20%,40%)]">
          <Users className="w-4 h-4" />
          <span>{members.length}</span>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 text-[hsl(300,20%,40%)]">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No members yet</p>
          <p className="text-xs mt-1">Add members to track expenses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map((member, index) => {
            const burnRate = totalSpent > 0 ? (member.totalSpent / totalSpent) * 100 : 0;
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onMemberClick(member)}
                className="bg-white border-[4px] border-black p-4 cursor-pointer hover:shadow-[4px_4px_0_0_rgba(62,2,75,0.3)] transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[hsl(289,96%,15%)] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-[hsl(289,96%,15%)]">
                        {member.name}
                      </h4>
                      <span className="brutal-badge text-[10px] mt-1 bg-[hsl(300,14%,90%)]">
                        {member.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t-[2px] border-[hsl(300,14%,90%)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[hsl(351,70%,61%)]">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-display text-xs font-bold">
                        {formatIDR(member.totalSpent)}
                      </span>
                    </div>
                    <span className="text-xs text-[hsl(300,20%,40%)]">
                      {burnRate.toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Burn rate bar */}
                  <div className="mt-2 h-2 bg-[hsl(300,14%,90%)] border-[2px] border-black">
                    <div
                      className="h-full bg-[hsl(351,70%,61%)]"
                      style={{ width: `${Math.min(burnRate, 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
