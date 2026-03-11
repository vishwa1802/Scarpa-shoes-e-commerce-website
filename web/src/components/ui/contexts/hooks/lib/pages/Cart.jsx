import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchCart();
    }
  }, [currentUser]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cart = await pb.collection('cart').getFullList({
        filter: `userId = "${currentUser.id}"`,
        $autoCancel: false
      });

      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        cart.map(async (item) => {
          try {
            const product = await pb.collection('products').getOne(item.productId, { $autoCancel: false });
            return { ...item, product };
          } catch (err) {
            console.error('Error fetching product:', err);
            return null;
          }
        })
      );

      setCartItems(itemsWithProducts.filter(item => item !== null));
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await pb.collection('cart').update(cartItemId, { quantity: newQuantity }, { $autoCancel: false });
      setCartItems(prev =>
        prev.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast({
        title: 'Cart Updated',
        description: 'Quantity updated successfully'
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'destructive'
      });
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await pb.collection('cart').delete(cartItemId, { $autoCancel: false });
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      toast({
        title: 'Item Removed',
        description: 'Item removed from cart'
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive'
      });
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 5000 ? 0 : 50;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading cart...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shopping Cart - Scarpa Shoes</title>
        <meta name="description" content="Review your shopping cart and proceed to checkout." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
              <p className="text-slate-600 mb-6">Add some products to get started!</p>
              <Button onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div 
                          className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/product/${item.product.id}`)}
                        >
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={pb.files.getUrl(item.product, item.product.images[0])}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 
                            className="font-semibold text-lg text-slate-900 mb-1 cursor-pointer hover:text-slate-700"
                            onClick={() => navigate(`/product/${item.product.id}`)}
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-slate-600 text-sm mb-2">{item.product.category}</p>
                          <p className="text-xl font-bold text-slate-900">
                            ₹{item.product.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-lg font-semibold w-12 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <p className="text-lg font-bold text-slate-900 mt-2">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-slate-700">
                        <span>Subtotal</span>
                        <span>₹{calculateSubtotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Tax (10%)</span>
                        <span>₹{calculateTax().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Shipping</span>
                        <span>
                          {calculateShipping() === 0 ? (
                            <span className="text-green-600 font-semibold">FREE</span>
                          ) : (
                            `₹${calculateShipping()}`
                          )}
                        </span>
                      </div>
                      {calculateSubtotal() < 5000 && (
                        <p className="text-sm text-slate-600">
                          Add ₹{(5000 - calculateSubtotal()).toLocaleString()} more for free shipping
                        </p>
                      )}
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-xl font-bold text-slate-900">
                          <span>Total</span>
                          <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full mb-3" 
                      size="lg"
                      onClick={() => navigate('/checkout')}
                    >
                      Proceed to Checkout
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/products')}
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;