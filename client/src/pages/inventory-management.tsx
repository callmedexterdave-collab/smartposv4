import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, Plus, Edit, Trash2, Package } from 'lucide-react';
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
import { ProductService } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  quantity: z.number().min(0, 'Quantity must be 0 or greater'),
  category: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const InventoryManagement: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      barcode: '',
      price: 0,
      quantity: 0,
      category: 'general',
    },
  });

  const loadProducts = async () => {
    try {
      const allProducts = await ProductService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, data);
        toast({
          title: 'Product Updated',
          description: `${data.name} has been updated`,
        });
      } else {
        await ProductService.addProduct(data);
        toast({
          title: 'Product Added',
          description: `${data.name} has been added to inventory`,
        });
      }
      
      await loadProducts();
      setIsAddDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await ProductService.deleteProduct(deletingProduct.id);
      toast({
        title: 'Product Deleted',
        description: `${deletingProduct.name} has been removed from inventory`,
      });
      await loadProducts();
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'out', color: 'text-red-500', label: 'out of stock' };
    if (quantity < 10) return { status: 'low', color: 'text-orange-500', label: 'low stock' };
    return { status: 'good', color: 'text-gray-800', label: 'in stock' };
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="bg-success-500 text-white p-6 rounded-b-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Inventory</h2>
              <p className="text-success-100 text-sm">Manage your products</p>
            </div>
            <button
              onClick={() => setLocation('/admin-main')}
              data-testid="button-back-home"
              className="bg-success-600 p-2 rounded-lg touch-feedback"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
                className="pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-success-500 focus:border-transparent"
              />
            </div>
            <button className="bg-white p-3 rounded-xl border border-gray-300 shadow-sm touch-feedback">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Product List */}
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Add your first product to get started'
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  data-testid="button-add-first-product"
                  className="bg-success-500 hover:bg-success-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3 mb-20">
              {filteredProducts.map((product, index) => {
                const stockStatus = getStockStatus(product.quantity);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between"
                    data-testid={`product-${product.id}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-500">Barcode: {product.barcode}</p>
                      <p className="text-success-600 font-medium">₱{product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${stockStatus.color}`}>
                        {product.quantity}
                      </div>
                      <div className={`text-xs ${stockStatus.color}`}>
                        {stockStatus.label}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEdit(product)}
                          data-testid={`button-edit-${product.id}`}
                          className="text-primary-500 p-1 touch-feedback"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
                          data-testid={`button-delete-${product.id}`}
                          className="text-red-500 p-1 touch-feedback"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Floating Action Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            setEditingProduct(null);
            form.reset();
            setIsAddDialogOpen(true);
          }}
          data-testid="button-add-product"
          className="fixed bottom-24 right-6 bg-success-500 text-white p-4 rounded-full shadow-lg hover:bg-success-600 touch-feedback"
        >
          <Plus className="w-6 h-6" />
        </motion.button>

        {/* Add/Edit Product Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter product name"
                          data-testid="input-product-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter barcode"
                          data-testid="input-barcode"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₱)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            data-testid="input-price"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            data-testid="input-quantity"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., drinks, snacks"
                          data-testid="input-category"
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
                    data-testid="button-cancel"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    data-testid="button-save-product"
                    className="flex-1 bg-success-500 hover:bg-success-600"
                  >
                    {isLoading ? 'Saving...' : (editingProduct ? 'Update' : 'Add')} Product
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                data-testid="button-confirm-delete"
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </Layout>
  );
};

export default InventoryManagement;
