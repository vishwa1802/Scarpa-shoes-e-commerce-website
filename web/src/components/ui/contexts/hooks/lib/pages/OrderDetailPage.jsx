import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, ChevronLeft } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchOrder();
    }
  }, [id, currentUser]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const record = await pb.collection('orders').getOne(id, { $autoCancel: false });
      
      // Verify order belongs to current user
      if (record.userId !== currentUser.id) {
        setError('Order not found');
        return;
      }
      
      setOrder(record);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading order...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
            <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Order #${order.id.slice(0, 8).toUpperCase()} - Scarpa Shoes`}</title>
        <meta name="description" content="View your order details and track delivery status." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-5xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/orders')}
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-slate-600">
                Placed on {new Date(order.created).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2`}>
              {order.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{item.name}</h3>
                          <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-600">
                            ₹{item.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.deliveryAddress ? (
                    <div className="text-slate-700">
                      <p>{order.deliveryAddress.address}</p>
                      <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                      <p>Pincode: {order.deliveryAddress.pincode}</p>
                      <p className="mt-2">Phone: {order.deliveryAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-slate-600">No delivery address provided</p>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{order.paymentMethod || 'Not specified'}</p>
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
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal</span>
                      <span>
                        ₹{order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Tax (10%)</span>
                      <span>
                        ₹{(order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.1).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Shipping</span>
                      <span>
                        {order.totalPrice > 5000 ? (
                          <span className="text-green-600 font-semibold">FREE</span>
                        ) : (
                          '₹50'
                        )}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-xl font-bold text-slate-900">
                        <span>Total</span>
                        <span>₹{order.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailPage;