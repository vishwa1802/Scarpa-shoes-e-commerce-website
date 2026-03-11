import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SuccessPage = () => {
  return (
    <>
      <Helmet>
        <title>Order Successful - Scarpa Shoes</title>
        <meta name="description" content="Thank you for your order! Your payment was successful and your order is being processed." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <Header />

        <div className="max-w-3xl mx-auto px-4 py-16">
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                
                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                  Order Successful!
                </h1>
                
                <p className="text-xl text-slate-600 mb-8">
                  Thank you for your purchase. Your order has been confirmed and is being processed.
                </p>

                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 mb-8 border border-slate-200">
                  <div className="flex items-start gap-4 text-left">
                    <Package className="w-6 h-6 text-slate-600 flex-shrink-0 mt-1" />
                    <div>
                      <h2 className="font-semibold text-slate-900 mb-2">What happens next?</h2>
                      <ul className="text-slate-700 space-y-2 text-sm">
                        <li>• You will receive an order confirmation email shortly</li>
                        <li>• Your order details and tracking information will be included</li>
                        <li>• We'll notify you when your order ships</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/">
                    <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg w-full sm:w-auto">
                      Continue Shopping
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SuccessPage;