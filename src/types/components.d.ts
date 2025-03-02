// Component props
declare module '@/components/tasks/TaskItem' {
  import { Task } from '@/models/types';
  
  export interface TaskItemProps {
    task: Task;
    onComplete: (id: number) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
  }
  
  const TaskItem: React.FC<TaskItemProps>;
  export default TaskItem;
}

declare module '@/components/layout/Layout' {
  export interface LayoutProps {
    children: React.ReactNode;
  }
  
  const Layout: React.FC<LayoutProps>;
  export default Layout;
}

declare module '@/components/layout/Sidebar' {
  export interface SidebarProps {
    isOpen: boolean;
  }
  
  const Sidebar: React.FC<SidebarProps>;
  export default Sidebar;
}

declare module '@/components/layout/Header' {
  export interface HeaderProps {
    toggleSidebar: () => void;
  }
  
  const Header: React.FC<HeaderProps>;
  export default Header;
} 