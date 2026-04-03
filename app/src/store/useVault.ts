import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vault, VaultStore, Project, Member, Log } from '@/types/vault';
import { encodeSaveCode, decodeSaveCode } from '@/lib/savecode';
import { generateId, getTimestamp } from '@/lib/format';

const initialState: Vault = {
  projects: [],
  activeProjectId: null,
  lastSavedAt: null,
};

export const useVault = create<VaultStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Projects
      addProject: (name: string) => {
        const newProject: Project = {
          id: generateId(),
          name,
          balance: 0,
          members: [],
          logs: [],
          createdAt: getTimestamp(),
          updatedAt: getTimestamp(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
          lastSavedAt: getTimestamp(),
        }));
      },

      updateProject: (id: string, name: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: getTimestamp() } : p
          ),
          lastSavedAt: getTimestamp(),
        }));
      },

      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
          lastSavedAt: getTimestamp(),
        }));
      },

      setActiveProject: (id: string | null) => {
        set({ activeProjectId: id });
      },

      // Members
      addMember: (projectId: string, name: string, role: string) => {
        const newMember: Member = {
          id: generateId(),
          name,
          role: role || 'Crew',
          totalSpent: 0,
          createdAt: getTimestamp(),
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, members: [...p.members, newMember], updatedAt: getTimestamp() }
              : p
          ),
          lastSavedAt: getTimestamp(),
        }));
      },

      deleteMember: (projectId: string, memberId: string, refund: boolean) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;

        const member = project.members.find((m) => m.id === memberId);
        if (!member) return;

        let newBalance = project.balance;
        const newLogs = [...project.logs];

        if (refund && member.totalSpent > 0) {
          // Refund: add member's total spent back to balance
          newBalance += member.totalSpent;
          const refundLog: Log = {
            id: generateId(),
            timestamp: getTimestamp(),
            type: 'DECOMMISSION',
            context: `Decommissioned: ${member.name} (REFUND)`,
            value: member.totalSpent,
            memberId: null,
            participantCount: 0,
          };
          newLogs.push(refundLog);
        } else {
          // Retain: just log the decommission
          const retainLog: Log = {
            id: generateId(),
            timestamp: getTimestamp(),
            type: 'DECOMMISSION',
            context: `Decommissioned: ${member.name} (RETAIN)`,
            value: 0,
            memberId: null,
            participantCount: 0,
          };
          newLogs.push(retainLog);
        }

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  balance: newBalance,
                  members: p.members.filter((m) => m.id !== memberId),
                  logs: newLogs,
                  updatedAt: getTimestamp(),
                }
              : p
          ),
          lastSavedAt: getTimestamp(),
        }));
      },

      // Transactions
      addExpense: (projectId: string, amount: number, context: string, participantIds?: string[]) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;

        const expenseAmount = Math.abs(amount);
        const newBalance = project.balance - expenseAmount;

        let newMembers = [...project.members];
        let logMemberId: string | null = null;
        let participantCount = 0;

        // If there are no members in the project, do not allow expense
        if (!project.members || project.members.length === 0) return;

        if (participantIds && participantIds.length > 0) {
          participantCount = participantIds.length;

          if (participantCount === 1) {
            // Direct expense assigned to single member
            logMemberId = participantIds[0];
            newMembers = newMembers.map((m) =>
              m.id === logMemberId ? { ...m, totalSpent: m.totalSpent + expenseAmount } : m
            );
          } else {
            // Shared among specified participants
            const splitAmount = expenseAmount / participantCount;
            newMembers = newMembers.map((m) =>
              participantIds.includes(m.id)
                ? { ...m, totalSpent: m.totalSpent + splitAmount }
                : m
            );
          }
        } else {
          // No participantIds passed — default to splitting among ALL members
          const activeMembers = newMembers.filter((m) => m.totalSpent >= 0);
          participantCount = activeMembers.length;

          if (participantCount > 0) {
            const splitAmount = expenseAmount / participantCount;
            newMembers = newMembers.map((m) => ({
              ...m,
              totalSpent: m.totalSpent + splitAmount,
            }));
          }
        }

        const expenseLog: Log = {
          id: generateId(),
          timestamp: getTimestamp(),
          type: 'EXPENSE',
          context,
          value: -expenseAmount,
          memberId: logMemberId,
          participantCount,
        };

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  balance: newBalance,
                  members: newMembers,
                  logs: [...p.logs, expenseLog],
                  updatedAt: getTimestamp(),
                }
              : p
          ),
          lastSavedAt: getTimestamp(),
        }));
      },

      addInjection: (projectId: string, amount: number, context: string) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;

        const injectionAmount = Math.abs(amount);
        const newBalance = project.balance + injectionAmount;

        const injectionLog: Log = {
          id: generateId(),
          timestamp: getTimestamp(),
          type: 'INJECTION',
          context,
          value: injectionAmount,
          memberId: null,
          participantCount: 0,
        };

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  balance: newBalance,
                  logs: [...p.logs, injectionLog],
                  updatedAt: getTimestamp(),
                }
              : p
          ),
          lastSavedAt: getTimestamp(),
        }));
      },

      deleteLog: (projectId: string, logId: string) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        if (!project) return;

        const log = project.logs.find((l) => l.id === logId);
        if (!log) return;

        let newBalance = project.balance;
        let newMembers = [...project.members];

        // Reverse the transaction
        if (log.type === 'EXPENSE') {
          const expenseAmount = Math.abs(log.value);
          newBalance += expenseAmount; // Add back to balance

          if (log.memberId) {
            // Direct expense - reverse from specific member
            newMembers = newMembers.map((m) =>
              m.id === log.memberId ? { ...m, totalSpent: m.totalSpent - expenseAmount } : m
            );
          } else if (log.participantCount > 0) {
            // Shared expense - reverse split from all members
            const splitAmount = expenseAmount / log.participantCount;
            newMembers = newMembers.map((m) => ({
              ...m,
              totalSpent: m.totalSpent - splitAmount,
            }));
          }
        } else if (log.type === 'INJECTION') {
          // Reverse injection - subtract from balance
          newBalance -= log.value;
        } else if (log.type === 'DECOMMISSION') {
          // Reverse decommission refund
          if (log.value > 0) {
            newBalance -= log.value;
          }
        }

        // Add void log
        const voidLog: Log = {
          id: generateId(),
          timestamp: getTimestamp(),
          type: 'VOID',
          context: `Voided: ${log.context}`,
          value: 0,
          memberId: null,
          participantCount: 0,
        };

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  balance: newBalance,
                  members: newMembers,
                  logs: [...p.logs.filter((l) => l.id !== logId), voidLog],
                  updatedAt: getTimestamp(),
                }
              : p
          ),
          lastSavedAt: getTimestamp(),
        }));
      },

      // Save System
      exportSaveCode: () => {
        const state = get();
        return encodeSaveCode({
          projects: state.projects,
          activeProjectId: state.activeProjectId,
          lastSavedAt: getTimestamp(),
        });
      },

      importSaveCode: (code: string) => {
        const vault = decodeSaveCode(code);
        if (!vault) return false;

        set({
          projects: vault.projects,
          activeProjectId: vault.activeProjectId,
          lastSavedAt: getTimestamp(),
        });
        return true;
      },

      clearVault: () => {
        set(initialState);
      },
    }),
    {
      name: 'codiroom-vault',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
