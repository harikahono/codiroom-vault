import { Plus, Folder, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVault } from '@/store/useVault';
import { formatIDR } from '@/lib/format';
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

interface SidebarProps {
  onAddProject: () => void;
}

export function Sidebar({ onAddProject }: SidebarProps) {
  const { projects, activeProjectId, setActiveProject, deleteProject } = useVault();

  return (
    <aside className="w-72 bg-[hsl(300,14%,94%)] border-r-[6px] border-black flex flex-col sticky top-0 h-screen">
      {/* Sidebar Header */}
      <div className="p-4 border-b-[4px] border-black">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-sm uppercase tracking-wide text-[hsl(289,96%,15%)]">
            Projects
          </h2>
          <button
            onClick={onAddProject}
            className="w-8 h-8 bg-[hsl(289,96%,15%)] text-white flex items-center justify-center hover:bg-[hsl(289,96%,25%)] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[hsl(300,20%,40%)]">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {projects.length === 0 ? (
          <div className="text-center p-8 text-[hsl(300,20%,40%)]">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No projects yet</p>
            <button
              onClick={onAddProject}
              className="text-[hsl(289,96%,15%)] font-bold underline mt-2 text-sm"
            >
              Create one
            </button>
          </div>
        ) : (
          projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveProject(project.id)}
              className={`
                relative p-3 cursor-pointer border-[4px] transition-all
                ${activeProjectId === project.id
                  ? 'bg-white border-[hsl(289,96%,15%)]'
                  : 'bg-transparent border-transparent hover:border-black hover:bg-white'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm truncate text-[hsl(289,96%,15%)]">
                    {project.name}
                  </h3>
                  <p className="text-xs text-[hsl(300,20%,40%)] mt-1">
                    {formatIDR(project.balance)}
                  </p>
                  <p className="text-xs text-[hsl(300,20%,40%)]">
                    {project.members.length} members
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {activeProjectId === project.id && (
                    <ChevronRight className="w-4 h-4 text-[hsl(289,96%,15%)]" />
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 flex items-center justify-center text-[hsl(300,20%,40%)] hover:text-[hsl(336,93%,18%)] hover:bg-[hsl(336,93%,18%)] hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="brutal-card-lg border-[6px] border-black">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display text-xl">
                          Delete Project?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[hsl(300,20%,30%)]">
                          This will permanently delete "{project.name}" and all its data.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="brutal-btn border-[4px] border-black">
                          CANCEL
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProject(project.id)}
                          className="brutal-btn-danger"
                        >
                          DELETE
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t-[4px] border-black bg-[hsl(300,14%,90%)]">
        <div className="text-xs text-[hsl(300,20%,40%)]">
          <p className="font-bold text-[hsl(289,96%,15%)] mb-1">Total Balance</p>
          <p className="font-display text-lg font-bold text-[hsl(289,96%,15%)]">
            {formatIDR(projects.reduce((sum, p) => sum + p.balance, 0))}
          </p>
        </div>
      </div>
    </aside>
  );
}
