import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Trash2, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthService, StaffService } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Staff } from '@shared/schema';

const staffSchema = z.object({
  name: z.string().min(1, 'Staff name is required'),
  staffId: z.string().min(1, 'Staff ID is required'),
  passkey: z.string().min(4, 'Passkey must be at least 4 characters'),
});

type StaffFormData = z.infer<typeof staffSchema>;

const StaffManagement: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      staffId: '',
      passkey: '',
    },
  });

  const loadStaff = async () => {
    try {
      const allStaff = await StaffService.getAllStaff();
      setStaff(allStaff);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff list',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const onSubmit = async (data: StaffFormData) => {
    setIsLoading(true);
    try {
      await AuthService.createStaff({
        ...data,
        createdBy: user?.id || '',
      });
      
      toast({
        title: 'Staff Added',
        description: `${data.name} has been added to your team`,
      });
      
      await loadStaff();
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to add staff member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;

    try {
      await StaffService.deleteStaff(deletingStaff.id);
      toast({
        title: 'Staff Removed',
        description: `${deletingStaff.name} has been removed from your team`,
      });
      await loadStaff();
      setDeletingStaff(null);
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove staff member',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="bg-warning-500 text-white p-6 rounded-b-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Staff Management</h2>
              <p className="text-warning-100 text-sm">Manage your team</p>
            </div>
            <button
              onClick={() => setLocation('/admin-main')}
              data-testid="button-back-home"
              className="bg-warning-600 p-2 rounded-lg touch-feedback"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {/* Staff List */}
          {staff.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No staff members yet</h3>
              <p className="text-gray-500 mb-6">Add your first staff member to get started</p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                data-testid="button-add-first-staff"
                className="bg-warning-500 hover:bg-warning-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3 mb-20">
              {staff.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-4 rounded-xl shadow-sm"
                  data-testid={`staff-${member.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-6 h-6 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{member.name}</h3>
                        <p className="text-sm text-gray-500">Staff ID: {member.staffId}</p>
                        <p className="text-xs text-gray-400">
                          Created: {formatDate(member.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeletingStaff(member)}
                      data-testid={`button-delete-staff-${member.id}`}
                      className="text-red-500 p-2 touch-feedback"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add Staff Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setIsAddDialogOpen(true)}
          data-testid="button-add-staff"
          className="fixed bottom-24 right-6 bg-warning-500 text-white p-4 rounded-full shadow-lg hover:bg-warning-600 touch-feedback"
        >
          <UserPlus className="w-6 h-6" />
        </motion.button>

        {/* Add Staff Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter staff member's full name"
                          data-testid="input-staff-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., STAFF001"
                          data-testid="input-staff-id-create"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="passkey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passkey</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a secure passkey"
                          data-testid="input-staff-passkey"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel-staff"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    data-testid="button-save-staff"
                    className="flex-1 bg-warning-500 hover:bg-warning-600"
                  >
                    {isLoading ? 'Adding...' : 'Add Staff'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingStaff} onOpenChange={() => setDeletingStaff(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{deletingStaff?.name}" from your team? 
                They will no longer be able to access the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-staff">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                data-testid="button-confirm-delete-staff"
                className="bg-red-500 hover:bg-red-600"
              >
                Remove Staff
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </Layout>
  );
};

export default StaffManagement;
