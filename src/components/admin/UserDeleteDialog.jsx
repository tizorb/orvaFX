
    import React from 'react';
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
    } from "@/components/ui/alert-dialog";
    import { Button } from "@/components/ui/button";
    import { Trash2 } from 'lucide-react';

    const UserDeleteDialog = ({ user, onDelete, t }) => {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
              <Trash2 size={16} className="mr-1" /> {t('admin_users_delete_button')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400">{t('admin_users_delete_confirm_title')}</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                {t('admin_users_delete_confirm_desc', { username: user.username })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">{t('admin_button_cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700 text-white">
                {t('admin_users_delete_button')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };

    export default UserDeleteDialog;
  