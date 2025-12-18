import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users, UserCheck, Shield, Search, Mail, Crown, User, X, Package, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

interface Order {
  id: string;
  customer_name: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

const ITEMS_PER_PAGE = 10;

const AdminUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch profiles
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Fetch user roles
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (error) throw error;
      return data as UserRole[];
    },
  });

  // Fetch orders for selected user
  const { data: userOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['user-orders', selectedUser?.user_id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', selectedUser.user_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!selectedUser,
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'moderator' | 'user' }) => {
      const existingRole = roles.find(r => r.user_id === userId);
      
      if (existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update role: ' + error.message);
    },
  });

  const getUserRole = (userId: string): 'admin' | 'moderator' | 'user' => {
    const role = roles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openUserModal = (profile: UserProfile) => {
    setSelectedUser(profile);
    setIsModalOpen(true);
  };

  const stats = [
    { 
      label: 'Total Users', 
      value: profiles.length, 
      icon: Users, 
      gradient: 'from-violet-500 to-purple-500' 
    },
    { 
      label: 'Admins', 
      value: roles.filter(r => r.role === 'admin').length, 
      icon: Crown, 
      gradient: 'from-amber-500 to-orange-500' 
    },
    { 
      label: 'Moderators', 
      value: roles.filter(r => r.role === 'moderator').length, 
      icon: Shield, 
      gradient: 'from-emerald-500 to-teal-500' 
    },
    { 
      label: 'Regular Users', 
      value: roles.filter(r => r.role === 'user').length, 
      icon: UserCheck, 
      gradient: 'from-blue-500 to-cyan-500' 
    },
  ];

  const isLoading = loadingProfiles || loadingRoles;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage users and assign roles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {stats.map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="bg-[#111111] rounded-xl sm:rounded-2xl border border-white/5 p-3 sm:p-5">
              <div className="flex items-start justify-between mb-2 sm:mb-4">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">{value}</p>
              <p className="text-xs sm:text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search users by name or ID..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-[#111111] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        {/* Users Table */}
        <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">User</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden md:table-cell">User ID</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Current Role</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden sm:table-cell">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : paginatedProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedProfiles.map((profile) => {
                    const currentRole = getUserRole(profile.user_id);
                    return (
                      <tr 
                        key={profile.id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => openUserModal(profile)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                              {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-violet-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{profile.full_name || 'No name'}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {profile.user_id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                            {profile.user_id.slice(0, 16)}...
                          </code>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentRole === 'admin' ? 'bg-amber-500/20 text-amber-400' :
                            currentRole === 'moderator' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {currentRole}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 hidden sm:table-cell text-sm">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={currentRole}
                            onValueChange={(value: 'admin' | 'moderator' | 'user') => {
                              updateRoleMutation.mutate({ userId: profile.user_id, newRole: value });
                            }}
                          >
                            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/5">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProfiles.length)} of {filteredProfiles.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum 
                          ? "bg-orange-500 text-white" 
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-violet-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedUser.full_name || 'No name'}</h3>
                  <p className="text-sm text-gray-400">User ID: {selectedUser.user_id}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getUserRole(selectedUser.user_id) === 'admin' ? 'bg-amber-500/20 text-amber-400' :
                      getUserRole(selectedUser.user_id) === 'moderator' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {getUserRole(selectedUser.user_id)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order History ({userOrders.length})
                </h4>
                
                {loadingOrders ? (
                  <p className="text-gray-500 text-center py-4">Loading orders...</p>
                ) : userOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 bg-white/5 rounded-xl">No orders found</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {userOrders.map((order) => (
                      <div key={order.id} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">#{order.id.slice(0, 8)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                            order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <span className="font-bold text-orange-400">${order.total.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {Array.isArray(order.items) ? order.items.length : 0} item(s)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-2xl font-bold text-white">{userOrders.length}</p>
                  <p className="text-xs text-gray-500">Total Orders</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-2xl font-bold text-orange-400">
                    ${userOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-400">
                    {userOrders.filter(o => o.status === 'delivered').length}
                  </p>
                  <p className="text-xs text-gray-500">Delivered</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;