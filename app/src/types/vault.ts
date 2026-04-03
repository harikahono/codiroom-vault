export interface Member {
  id: string;
  name: string;
  role: string;
  totalSpent: number;
  createdAt: string;
}

export interface Log {
  id: string;
  timestamp: string;
  type: 'INJECTION' | 'EXPENSE' | 'VOID' | 'DECOMMISSION';
  context: string;
  value: number;
  memberId: string | null;
  participantCount: number;
}

export interface Project {
  id: string;
  name: string;
  balance: number;
  members: Member[];
  logs: Log[];
  createdAt: string;
  updatedAt: string;
}

export interface Vault {
  projects: Project[];
  activeProjectId: string | null;
  lastSavedAt: string | null;
}

export interface VaultActions {
  // Projects
  addProject: (name: string) => void;
  updateProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;

  // Members
  addMember: (projectId: string, name: string, role: string) => void;
  deleteMember: (projectId: string, memberId: string, refund: boolean) => void;

  // Transactions
  addExpense: (projectId: string, amount: number, context: string, participantIds?: string[]) => void;
  addInjection: (projectId: string, amount: number, context: string) => void;
  deleteLog: (projectId: string, logId: string) => void;

  // Save System
  exportSaveCode: () => string;
  importSaveCode: (code: string) => boolean;
  clearVault: () => void;
}

export type VaultStore = Vault & VaultActions;
