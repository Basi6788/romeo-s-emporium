import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users, UserCheck, Shield, Search, Mail, Crown, User } from 'lucide-react';
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

const AdminUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
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

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'moderator' | 'user' }) => {
      // Check if role exists
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
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-500 mt-1">Manage users and assign roles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="bg-[#111111] rounded-2xl border border-white/5 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
                ) : filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((profile) => {
                    const currentRole = getUserRole(profile.user_id);
                    return (
                      <tr key={profile.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
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
                        <td className="p-4">
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;