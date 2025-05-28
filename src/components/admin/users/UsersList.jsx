
    import React from 'react';
    import { AnimatePresence } from 'framer-motion';

    const UsersList = ({ users, onEdit, onDelete, t, toast, UserCardComponent }) => {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {users.map(user => (
              <UserCardComponent 
                key={user.id} 
                user={user} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                t={t} 
                toast={toast} 
              />
            ))}
          </AnimatePresence>
        </div>
      );
    };

    export default UsersList;
  