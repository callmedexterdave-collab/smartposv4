import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, LogOut, User, Store } from 'lucide-react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileSettings: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: user?.businessName || '',
      ownerName: user?.ownerName || '',
      mobile: user?.mobile || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // In a real app, this would update the user in the database
      // For now, we'll just show a success message
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
    setLocation('/role-selection');
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="bg-gray-700 text-white p-6 rounded-b-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Profile & Settings</h2>
              <p className="text-gray-300 text-sm">Manage your account</p>
            </div>
            <button
              onClick={() => setLocation('/admin-main')}
              data-testid="button-back-home"
              className="bg-gray-600 p-2 rounded-lg touch-feedback"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Profile Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-sm text-center"
          >
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="font-semibold text-gray-800">
              {user?.businessName} | Admin
            </h3>
            <p className="text-gray-500 text-sm">{user?.ownerName}</p>
          </motion.div>

          {/* Store Information */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <div className="flex items-center mb-3">
              <Store className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Store Information</h3>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600 text-sm">Business Name</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-business-name-edit"
                          className="border-gray-300 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600 text-sm">Owner Name</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-owner-name-edit"
                          className="border-gray-300 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600 text-sm">Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          data-testid="input-mobile-edit"
                          className="border-gray-300 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </motion.div>
          
          {/* App Settings */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <h3 className="font-semibold text-gray-800 mb-3">App Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Auto-scan timeout</span>
                <select 
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  data-testid="select-scan-timeout"
                >
                  <option>2 seconds</option>
                  <option selected>3 seconds</option>
                  <option>5 seconds</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Sound notifications</span>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  data-testid="switch-sound"
                />
              </div>
            </div>
          </motion.div>
          
          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              data-testid="button-save-changes"
              className="w-full bg-primary-500 text-white p-4 rounded-xl font-semibold hover:bg-primary-600"
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setShowLogoutDialog(true)}
              data-testid="button-logout-profile"
              variant="destructive"
              className="w-full p-4 rounded-xl font-semibold touch-feedback"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out? You'll need to log in again to access the app.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-logout">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                data-testid="button-confirm-logout"
                className="bg-red-500 hover:bg-red-600"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </Layout>
  );
};

export default ProfileSettings;
