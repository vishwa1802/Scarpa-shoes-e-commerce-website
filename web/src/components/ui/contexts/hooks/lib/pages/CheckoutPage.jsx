import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

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

      const itemsWithProducts = await Promise.all(
        cart.map(async (item) => {
          try {
            const product = await pb.collection('products').getOne(item.productId, { $autoCancel: false });
            return { ...item, product };
          } catch (err) {
            return null;
          }
        })
      );

      setCartItems(itemsWithProducts.filter(item => item !== null));
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 5000 ? 0 : 50;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.state || 
        !deliveryAddress.pincode || !deliveryAddress.phone) {
      toast({
        title: 'Incomplete Address',
        description: 'Please fill in all delivery address fields',
        variant: 'destructive'
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      // Create order
      const order = await pb.collection('orders').create({
        userId: currentUser.id,
        items: orderItems,
        totalPrice: calculateTotal(),
        status: 'Pending',
        deliveryAddress: deliveryAddress,
        paymentMethod: paymentMethod
      }, { $autoCancel: false });

      // Clear cart
      await Promise.all(
        cartItems.map(item => pb.collection('cart').delete(item.id, { $autoCancel: false }))
      );

      toast({
        title: 'Order Placed!',
        description: 'Your order has been successfully placed'
      });

      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">Your cart is empty</p>
            <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Scarpa Shoes</title>
        <meta name="description" content="Complete your purchase at Scarpa Shoes." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Delivery Address & Payment */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={deliveryAddress.address}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
                        placeholder="123 Main Street"
                        required
                        className="text-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                          placeholder="Mumbai"
                          required
                          className="text-gray-900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                          placeholder="Maharashtra"
                          required
                          className="text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          value={deliveryAddress.pincode}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                          placeholder="400001"
                          required
                          className="text-gray-900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={deliveryAddress.phone}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                          placeholder="+91 1234567890"
                          required
                          className="text-gray-900"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value="COD" id="cod" />
                        <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery</Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value="Card" id="card" />
                        <Label htmlFor="card" className="cursor-pointer">Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="UPI" id="upi" />
                        <Label htmlFor="upi" className="cursor-pointer">UPI</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-sm text-slate-600 mt-4">
                      Note: This is a demo. No actual payment will be processed.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-700">
                            {item.product.name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3 space-y-2 mb-6">
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
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-xl font-bold text-slate-900">
                          <span>Total</span>
                          <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                      {submitting ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;