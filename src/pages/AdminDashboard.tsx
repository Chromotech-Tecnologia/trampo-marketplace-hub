import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  CreditCard, 
  BarChart3, 
  ClipboardList, 
  CheckSquare,
  Home,
  Package,
  TrendingUp
} from 'lucide-react';
import AdminStats from '@/components/admin/AdminStats';
import AdminPlans from '@/components/admin/AdminPlans';
import AdminPurchases from '@/components/admin/AdminPurchases';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminRequests from '@/components/admin/AdminRequests';
import AdminFinancials from '@/components/admin/AdminFinancials';

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: Home, component: "dashboard" },
  { title: "Usuários", url: "/admin/users", icon: Users, component: "users" },
  { title: "Solicitações", url: "/admin/requests", icon: ClipboardList, component: "requests" },
  { title: "Planos", url: "/admin/plans", icon: Package, component: "plans" },
  { title: "Compras Pendentes", url: "/admin/purchases", icon: CheckSquare, component: "purchases" },
  { title: "Financeiro", url: "/admin/financials", icon: BarChart3, component: "financials" },
  { title: "Configurações", url: "/admin/settings", icon: Settings, component: "settings" },
];

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/50";

  return (
    <Sidebar className="w-64">{/* collapsible */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("dashboard");

  // Determine current view based on URL
  React.useEffect(() => {
    const path = location.pathname;
    if (path === "/admin") {
      setCurrentView("dashboard");
    } else if (path.includes("users")) {
      setCurrentView("users");
    } else if (path.includes("requests")) {
      setCurrentView("requests");
    } else if (path.includes("plans")) {
      setCurrentView("plans");
    } else if (path.includes("purchases")) {
      setCurrentView("purchases");
    } else if (path.includes("financials")) {
      setCurrentView("financials");
    } else if (path.includes("settings")) {
      setCurrentView("settings");
    }
  }, [location.pathname]);

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <AdminStats />;
      case "users":
        return <AdminUsers />;
      case "requests":
        return <AdminRequests />;
      case "plans":
        return <AdminPlans />;
      case "purchases":
        return <AdminPurchases />;
      case "financials":
        return <AdminFinancials />;
      case "settings":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Configurações</h1>
            <p>Configurações do sistema em desenvolvimento...</p>
          </div>
        );
      default:
        return <AdminStats />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <img 
                src="/lovable-uploads/6c522438-4426-4558-834c-931bef48b71f.png" 
                alt="Mais Trampo" 
                className="h-8 w-auto"
              />
              <span className="text-lg font-semibold text-muted-foreground">Admin</span>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sair
            </button>
          </header>
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;