import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthService } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLogin: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const user = await AuthService.loginAdmin(data.username, data.password);
      if (user) {
        login(user);
        if (user.businessName) {
          setLocation('/admin-dashboard');
        } else {
          setLocation('/admin-main');
        }
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password',
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
          <Shield className="w-16 h-16 text-primary-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-gray-600 mt-2">Access your business dashboard</p>
        </motion.div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Mobile Number / Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your mobile number"
                      data-testid="input-username"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        data-testid="input-password"
                        className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                        className="absolute right-4 top-4 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-login"
              className="w-full bg-primary-500 text-white p-4 rounded-xl font-semibold shadow-lg hover:bg-primary-600 touch-feedback"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>
        
        <div className="text-center mt-6">
          <span className="text-gray-500">Don't have an account?</span>
          <button
            onClick={() => setLocation('/admin-signup')}
            data-testid="button-go-signup"
            className="text-primary-500 font-semibold ml-1"
          >
            Sign Up
          </button>
        </div>
        
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

export default AdminLogin;
