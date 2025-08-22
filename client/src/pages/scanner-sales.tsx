import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Trash2, CreditCard, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import Scanner from '@/components/Scanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ProductService, SalesService, AuthService, db } from '@/lib/db';
import type { CartItem } from '@shared/schema';

const ScannerSales: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user, isAdmin, isStaff } = useAuth();
  const { cart, addToCart, removeFromCart, updateCartItem, clearCart, getCartTotal } = useApp();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'cash' | 'ewallet'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  // Reset quantity after adding item
  useEffect(() => {
    if (cart.length > 0) {
      setQuantity(1);
    }
  }, [cart.length]);

  const handleBarcodeScan = async (barcode: string) => {
    try {
      // Validate barcode format
      if (!barcode || barcode.trim().length === 0) {
        toast({
          title: 'Invalid Barcode',
          description: 'Scanned barcode is empty or invalid',
          variant: 'destructive',
        });
        return;
      }

      const product = await ProductService.getProductByBarcode(barcode.trim());
      
      if (!product) {
        toast({
          title: 'Product Not Found',
          description: `No product found with barcode: ${barcode}`,
          variant: 'destructive',
        });
        return;
      }

      if (product.quantity < quantity) {
        toast({
          title: 'Insufficient Stock',
          description: `Only ${product.quantity} items available`,
          variant: 'destructive',
        });
        return;
      }

      // Check if adding this quantity would exceed available stock
      const existingCartItem = cart.find(item => item.productId === product.id);
      const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
      const totalQuantity = currentCartQuantity + quantity;

      if (totalQuantity > product.quantity) {
        toast({
          title: 'Insufficient Stock',
          description: `Cannot add ${quantity} more. Only ${product.quantity - currentCartQuantity} items available`,
          variant: 'destructive',
        });
        return;
      }

      const cartItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        subtotal: Math.round(product.price * quantity * 100) / 100,
      };

      addToCart(cartItem);
      
      toast({
        title: 'Product Added',
        description: `${product.name} (${quantity}) added to cart`,
      });

      // Auto-reset quantity
      setQuantity(1);
    } catch (error) {
      console.error('Error processing barcode scan:', error);
      toast({
        title: 'Scan Error',
        description: error instanceof Error ? error.message : 'Failed to process barcode scan',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (productId: string) => {
    if (isStaff) {
      // Staff needs admin password to delete
      setDeleteItemId(productId);
      return;
    }
    
    // Admin can delete directly
    removeFromCart(productId);
  };

  const confirmDeleteWithPassword = async () => {
    if (!adminPassword || !deleteItemId) return;

    try {
      // Get all admin users and verify password against any of them
      const adminUsers = await db.users.where('role').equals('admin').toArray();
      let adminVerified = false;
      
      for (const admin of adminUsers) {
        if (admin.username && await AuthService.loginAdmin(admin.username, adminPassword)) {
          adminVerified = true;
          break;
        }
      }
      
      if (adminVerified) {
        removeFromCart(deleteItemId);
        setDeleteItemId(null);
        setAdminPassword('');
        toast({
          title: 'Item Removed',
          description: 'Item removed from cart',
        });
      } else {
        toast({
          title: 'Access Denied',
          description: 'Invalid admin password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify admin password',
        variant: 'destructive',
      });
    }
  };

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Add products to cart before processing sale',
        variant: 'destructive',
      });
      return;
    }

    const total = getCartTotal();
    
    if (paymentType === 'cash' && paymentAmount < total) {
      toast({
        title: 'Insufficient Payment',
        description: `Payment amount must be at least ₱${total.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      await SalesService.processSale({
        items: cart,
        total,
        paymentType,
        paymentAmount: paymentType === 'cash' ? paymentAmount : total,
        staffId: user?.staffId || undefined,
      });

      toast({
        title: 'Sale Completed',
        description: `Sale of ₱${total.toFixed(2)} processed successfully!`,
      });

      // Clear cart and reset form
      clearCart();
      setPaymentAmount(0);
      setQuantity(1);

    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        title: 'Sale Failed',
        description: 'Failed to process sale. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout showNavigation={false}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-900"
      >
        {/* Header */}
        <div className="text-white p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Scanner & Sales</h2>
            <button
              onClick={() => setLocation(isAdmin ? '/admin-main' : '/role-selection')}
              data-testid="button-home"
              className="bg-gray-700 p-2 rounded-lg touch-feedback"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
          
          {/* Scanner Component */}
          <Scanner
            onResult={handleBarcodeScan}
            onError={(error) => {
              console.error('Scanner error:', error);
              toast({
                title: 'Scanner Error',
                description: 'Camera access failed or barcode scanning error',
                variant: 'destructive',
              });
            }}
          />
          
          {/* Input Controls */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-white text-sm mb-1">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                data-testid="input-quantity"
                className="bg-gray-800 text-white border-gray-600 focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Payment (₱)</label>
              <Input
                type="number"
                value={paymentAmount || ''}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                data-testid="input-payment"
                className="bg-gray-800 text-white border-gray-600 focus:border-primary-400"
              />
            </div>
          </div>

          {/* Payment Type */}
          <div className="mt-3">
            <label className="block text-white text-sm mb-1">Payment Type</label>
            <Select value={paymentType} onValueChange={(value: 'cash' | 'ewallet') => setPaymentType(value)}>
              <SelectTrigger data-testid="select-payment-type" className="bg-gray-800 text-white border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="ewallet">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Sales Cart */}
        <div className="bg-white rounded-t-3xl p-4 flex-1 min-h-96">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Sales Cart</h3>
          
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🛒</div>
              <p>Cart is empty</p>
              <p className="text-sm">Scan a product to get started</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  data-testid={`cart-item-${item.productId}`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      ₱{item.price.toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">₱{item.subtotal.toFixed(2)}</div>
                    <button
                      onClick={() => handleDeleteItem(item.productId)}
                      data-testid={`button-delete-${item.productId}`}
                      className="text-red-500 text-xs mt-1 touch-feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Total */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary-500" data-testid="text-cart-total">
                ₱{getCartTotal().toFixed(2)}
              </span>
            </div>
            
            {paymentType === 'cash' && paymentAmount > getCartTotal() && (
              <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                <span>Change:</span>
                <span data-testid="text-change">
                  ₱{(paymentAmount - getCartTotal()).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          
          {/* Pay Button */}
          <Button
            onClick={handleProcessSale}
            disabled={isProcessing || cart.length === 0}
            data-testid="button-pay"
            className="w-full bg-success-500 text-white p-4 rounded-xl font-semibold shadow-lg hover:bg-success-600 mt-4 touch-feedback"
          >
            {isProcessing ? 'Processing...' : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                PAY
              </>
            )}
          </Button>
        </div>

        {/* Admin Password Dialog for Staff Deletions */}
        <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-warning-500" />
                Admin Authorization Required
              </AlertDialogTitle>
              <AlertDialogDescription>
                Staff members need admin authorization to delete items from the cart.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                data-testid="input-admin-password"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteWithPassword}
                data-testid="button-confirm-delete"
                className="bg-red-500 hover:bg-red-600"
              >
                Delete Item
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </Layout>
  );
};

export default ScannerSales;
