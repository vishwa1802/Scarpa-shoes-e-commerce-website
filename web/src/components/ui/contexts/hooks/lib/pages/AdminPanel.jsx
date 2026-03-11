import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Trash2, Edit, Plus, Package, ShoppingCart, DollarSign } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import ProductForm from '@/components/ProductForm.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    if (isAdmin()) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsData = await pb.collection('products').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setProducts(productsData);

      // Fetch orders
      const ordersData = await pb.collection('orders').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setOrders(ordersData);

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.totalPrice, 0);
      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalRevenue: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await pb.collection('products').delete(productId, { $autoCancel: false });
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: 'Product Deleted',
        description: 'Product has been successfully deleted'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleProductFormClose = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    fetchData();
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await pb.collection('orders').update(orderId, { status: newStatus }, { $autoCancel: false });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast({
        title: 'Status Updated',
        description: 'Order status has been updated'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin()) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600">Access denied. Admin only.</p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading admin panel...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Scarpa Shoes</title>
        <meta name="description" content="Manage products and orders for Scarpa Shoes." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Admin Panel</h1>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="w-4 h-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="w-4 h-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products Management</TabsTrigger>
              <TabsTrigger value="orders">Orders Management</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Products</h2>
                <Button onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={pb.files.getUrl(product, product.images[0])}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">No Image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-slate-900 mb-1">{product.name}</h3>
                          <p className="text-slate-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-slate-700">
                              <strong>Price:</strong> ₹{product.price.toLocaleString()}
                            </span>
                            <span className="text-slate-700">
                              <strong>Category:</strong> {product.category}
                            </span>
                            <span className="text-slate-700">
                              <strong>Stock:</strong> {product.stock}
                            </span>
                            <span className="text-slate-700">
                              <strong>Rating:</strong> {product.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Orders</h2>

              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-slate-900 mb-2">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <div className="space-y-1 text-sm text-slate-700">
                            <p>
                              <strong>Date:</strong> {new Date(order.created).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Items:</strong> {order.items?.length || 0}
                            </p>
                            <p>
                              <strong>Total:</strong> ₹{order.totalPrice.toLocaleString()}
                            </p>
                            <p>
                              <strong>Payment:</strong> {order.paymentMethod}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-full md:w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            onClose={handleProductFormClose}
          />
        )}
      </div>
    </>
  );
};

export default AdminPanel;