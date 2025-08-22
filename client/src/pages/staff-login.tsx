import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { User, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthService } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const staffLoginSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  passkey: z.string().min(1, 'Passkey is required'),
});

type StaffLoginFormData = z.infer<typeof staffLoginSchema>;

const StaffLogin: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<StaffLoginFormData>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: {
      staffId: '',
      passkey: '',
    },
  });

  const onSubmit = async (data: StaffLoginFormData) => {
    setIsLoading(true);
    try {
      const user = await AuthService.loginStaff(data.staffId, data.passkey);
      if (user) {
        login(user);
        setLocation('/scanner');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid staff ID or passkey',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      <div className="p-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 pt-8"
        >
          <User className="w-16 h-16 text-gray-600 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Staff Login</h2>
          <p className="text-gray-600 mt-2">Enter your staff credentials</p>
        </motion.div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Staff ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your staff ID"
                      data-testid="input-staff-id"
                      className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  <FormLabel className="text-gray-700 font-medium">Passkey</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your passkey"
                      data-testid="input-passkey"
                      className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-staff-login"
              className="w-full bg-primary-500 text-white p-4 rounded-xl font-semibold shadow-lg hover:bg-primary-600 touch-feedback"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
        
        <button
          onClick={() => setLocation('/role-selection')}
          data-testid="button-back"
          className="mt-6 text-gray-400 flex items-center touch-feedback"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>
    </motion.div>
  );
};

export default StaffLogin;
