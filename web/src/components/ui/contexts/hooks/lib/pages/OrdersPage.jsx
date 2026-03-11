import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('orders').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setOrders(records);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
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
            <p className="mt-4 text-slate-600">Loading orders...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders - Scarpa Shoes</title>
        <meta name="description" content="View and track your orders at Scarpa Shoes." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Orders</h1>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Orders</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                {statusFilter === 'All' ? 'No orders yet' : `No ${statusFilter.toLowerCase()} orders`}
              </h2>
              <p className="text-slate-600 mb-6">
                {statusFilter === 'All' 
                  ? 'Start shopping to see your orders here!' 
                  : 'Try changing the filter to see other orders.'}
              </p>
              <Button onClick={() => navigate('/products')}>
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <p className="text-slate-600 text-sm mb-2">
                          Placed on {new Date(order.created).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>

                        <div className="text-sm text-slate-700">
                          <p className="mb-1">
                            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                          </p>
                          <p className="font-medium">Payment: {order.paymentMethod}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">
                            ₹{order.totalPrice.toLocaleString()}
                          </p>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-sm text-slate-600">
                              {item.name} (x{item.quantity})
                              {idx < Math.min(2, order.items.length - 1) && ','}
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-sm text-slate-600">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersPage;