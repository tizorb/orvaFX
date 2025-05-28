
    import React, { useState, useCallback, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";
    import { motion } from 'framer-motion';
    import { Users as UsersIcon, Search } from 'lucide-react';
    import UserEditDialog from '@/components/admin/UserEditDialog';
    import UserCard from '@/components/admin/users/UserCard';
    import UsersList from '@/components/admin/users/UsersList';
    import NoUsersFound from '@/components/admin/users/NoUsersFound';
    import { supabase } from '@/lib/supabaseClient';
    import { useAuth } from '@/contexts/AuthContext';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
            
    const UsersManager = ({ users: initialUsers = [], setUsers: setParentUsers, t, toast }) => {
      const [users, setUsersState] = useState(initialUsers);
      const [searchTerm, setSearchTerm] = useState('');
      const [editingUser, setEditingUser] = useState(null);
      const [isLoading, setIsLoading] = useState(false); // Renamed from 'loading' to avoid conflict
      const { user: adminUser } = useAuth();

      useEffect(() => {
        setUsersState(initialUsers);
      }, [initialUsers]);
    
      const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) {
          toast({ title: t('general_error_toast_title'), description: error.message, variant: "destructive" });
          setUsersState(initialUsers); // Fallback to initial or empty on error
        } else {
          setUsersState(data || []);
          if (setParentUsers) setParentUsers(data || []);
        }
        setIsLoading(false);
      }, [toast, t, initialUsers, setParentUsers]);

      useEffect(() => {
        if (initialUsers.length === 0 && supabase) {
            fetchUsers();
        }
      }, [fetchUsers, initialUsers.length]); // initialUsers.length dependency ensures it runs if initialUsers changes
    
      const handleSearch = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
      };
    
      const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.id?.toLowerCase().includes(searchTerm) ||
        user.auth_user_id?.toLowerCase().includes(searchTerm) ||
        user.role?.toLowerCase().includes(searchTerm)
      );
    
      const handleEdit = useCallback((userToEdit) => {
        setEditingUser({ ...userToEdit });
      }, []);
    
      const handleSaveEdit = useCallback(async () => {
        if (!editingUser || !editingUser.id) {
            toast({ title: t('general_error_toast_title'), description: "No user selected for editing or user ID is missing.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
      
        const { id: publicUserId, auth_user_id, role: newRole, ...otherUpdateData } = editingUser;
        const originalUser = users.find(u => u.id === publicUserId);
        const oldRole = originalUser?.role;
      
        let roleUpdateSuccessful = true;
        let profileUpdateSuccessful = false;
      
        // Step 1: Update user role via Edge Function if it changed
        if (newRole && newRole !== oldRole) {
          if (!auth_user_id) {
            toast({ title: t('general_error_toast_title'), description: "Authentication ID (auth_user_id) is missing for role update.", variant: "destructive" });
            setIsLoading(false);
            return;
          }
          try {
            const { data: functionData, error: functionError } = await supabase.functions.invoke('update-user-role', {
              body: { user_id_to_update: auth_user_id, new_role: newRole }
            });
      
            if (functionError) throw functionError;
            if (functionData?.error) throw new Error(functionData.error);
            
            toast({ title: t('admin_users_toast_success_title'), description: t('admin_users_toast_user_updated_desc', { username: editingUser.username, field: 'role', value: newRole }) });
            // The trigger 'handle_user_metadata_update' will sync to public.users.role
          } catch (error) {
            roleUpdateSuccessful = false;
            console.error('Error updating role via Edge Function:', error);
            toast({ title: t('general_error_toast_title'), description: `Failed to update role: ${error.message}`, variant: "destructive" });
          }
        }
      
        // Step 2: Update other user details in public.users table
        const publicProfileUpdatePayload = { ...otherUpdateData };
        delete publicProfileUpdatePayload.role; // Role is handled by trigger
        
        // Ensure numeric fields are numbers, or null if empty/invalid
        publicProfileUpdatePayload.wallet_balance_usdt = parseFloat(publicProfileUpdatePayload.wallet_balance_usdt);
        if (isNaN(publicProfileUpdatePayload.wallet_balance_usdt)) publicProfileUpdatePayload.wallet_balance_usdt = null;
        
        publicProfileUpdatePayload.referral_earnings_usdt = parseFloat(publicProfileUpdatePayload.referral_earnings_usdt);
        if (isNaN(publicProfileUpdatePayload.referral_earnings_usdt)) publicProfileUpdatePayload.referral_earnings_usdt = null;

        // Convert subscription_end_date to ISO string if it's a valid date, otherwise null
        if (publicProfileUpdatePayload.subscription_end_date) {
            const parsedDate = new Date(publicProfileUpdatePayload.subscription_end_date);
            if (!isNaN(parsedDate.getTime())) {
                publicProfileUpdatePayload.subscription_end_date = parsedDate.toISOString();
            } else {
                publicProfileUpdatePayload.subscription_end_date = null; 
            }
        } else {
            publicProfileUpdatePayload.subscription_end_date = null;
        }

        // Check if there are any actual changes to non-role fields
        const hasProfileChanges = Object.keys(publicProfileUpdatePayload).some(key => 
            publicProfileUpdatePayload[key] !== originalUser[key] &&
            // Special check for dates, as object comparison might fail
            !(originalUser[key] instanceof Date && publicProfileUpdatePayload[key] instanceof Date && originalUser[key].getTime() === publicProfileUpdatePayload[key].getTime())
        );

        if (hasProfileChanges) {
            const { data: updatedUserPublicProfile, error: publicProfileUpdateError } = await supabase
              .from('users')
              .update(publicProfileUpdatePayload)
              .eq('id', publicUserId)
              .select()
              .single();
      
            if (publicProfileUpdateError) {
              console.error('Error updating user public profile:', publicProfileUpdateError);
              toast({ title: t('general_error_toast_title'), description: `Failed to update user details: ${publicProfileUpdateError.message}`, variant: "destructive" });
            } else if (updatedUserPublicProfile){
              profileUpdateSuccessful = true;
              toast({ title: t('admin_users_toast_success_title'), description: t('admin_users_toast_user_updated_desc', { username: editingUser.username, field: 'profile details', value: '' }) });
            }
        } else if (!newRole || newRole === oldRole) {
            // No role change, no profile changes
            toast({ title: t('admin_users_toast_success_title'), description: "No changes detected in profile."});
        }
        
        // Refetch users to get the latest data, especially if role was updated (trigger) or other profile data
        if (roleUpdateSuccessful || profileUpdateSuccessful) {
            await fetchUsers(); 
        }
        
        setIsLoading(false);
        if(roleUpdateSuccessful) { 
            setEditingUser(null);
        }
      }, [editingUser, t, toast, setParentUsers, users, fetchUsers, adminUser]); // Added adminUser
          
      const handleDeleteUser = useCallback(async (userIdToDelete) => {
        // This should ideally be an Edge Function for security and cascading deletes if necessary
        console.warn(`Attempting to delete user ${userIdToDelete}. This is a placeholder.`);
        toast({ title: "User Deletion Not Implemented", description: "Secure user deletion should be handled by a dedicated Edge Function.", variant: "default" });
      }, [t, toast]); 
      
      const handleInputChange = useCallback((e, field) => {
        if (!editingUser) return;
        let value;
        // For Shadcn Select, the value comes directly, not from e.target
        if (field === 'role') { 
            value = e; // e is the value itself from onValueChange
        } else if (e.target && typeof e.target.type !== 'undefined') { // Standard input/checkbox
            value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        } else { // Fallback for other custom components if needed
            value = e;
        }
        setEditingUser(prev => ({ ...prev, [field]: value }));
      }, [editingUser]);
      
      const availableRolesForDialog = () => {
        if (adminUser?.role === 'superadmin') {
          return ['user', 'manager', 'admin', 'superadmin'];
        }
        if (adminUser?.role === 'admin') {
          return ['user', 'manager', 'admin']; 
        }
        // Default for other roles (e.g. manager, user) - should not typically open this dialog
        // Or, if they can, they should not be able to change roles.
        // For safety, return only 'user' or an empty array if non-admins somehow access this.
        return ['user']; 
      };

      if (isLoading && users.length === 0) {
        return (
          <div className="flex justify-center items-center min-h-[300px]">
            <LoadingSpinner size="lg" />
            <p className="ml-4 text-slate-300">{t('loading_data')}</p>
          </div>
        );
      }

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-0 sm:p-2 md:p-4">
          <Card className="bg-slate-800/70 border-slate-700 shadow-xl rounded-xl">
            <CardHeader className="text-center pt-6 pb-4 sm:pt-8 sm:pb-6">
              <div className="flex justify-center items-center mb-2 sm:mb-3">
                <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400 mr-2 sm:mr-3"/>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  {t('admin_users_management_section_title')}
                </CardTitle>
              </div>
              <CardDescription className="text-slate-400 text-sm sm:text-base">{t('admin_users_management_section_desc')}</CardDescription>
            </CardHeader>
            
            <CardContent className="px-3 sm:px-4 md:px-6">
              <div className="mb-6 sm:mb-8 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder={t('admin_users_search_placeholder')}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 bg-slate-700 border-slate-600 placeholder-slate-400 text-white focus:ring-pink-500 focus:border-pink-500 h-10 sm:h-12 text-sm sm:text-base rounded-lg"
                />
              </div>
        
              {isLoading && users.length > 0 && (
                <div className="absolute inset-0 bg-slate-800/50 flex justify-center items-center z-10 rounded-xl">
                  <LoadingSpinner />
                </div>
              )}
              {filteredUsers.length > 0 ? (
                <UsersList 
                  users={filteredUsers} 
                  onEdit={handleEdit} 
                  onDelete={handleDeleteUser} 
                  t={t} 
                  toast={toast} 
                  UserCardComponent={UserCard}
                />
              ) : (
                <NoUsersFound t={t} />
              )}
            </CardContent>
          </Card>
    
          {editingUser && (
            <UserEditDialog
              editingUser={editingUser}
              onClose={() => setEditingUser(null)}
              onSave={handleSaveEdit}
              onInputChange={handleInputChange}
              t={t}
              isLoading={isLoading}
              availableRoles={availableRolesForDialog()}
            />
          )}
        </motion.div>
      );
    };
    
    export default UsersManager;
  