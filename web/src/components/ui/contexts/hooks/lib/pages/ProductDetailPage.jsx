import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct, getProductQuantities } from '@/api/EcommerceApi';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';
import { ShoppingCart, Loader2, ArrowLeft, CheckCircle, Minus, Plus, XCircle, ChevronLeft, ChevronRight, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = useCallback(async () => {
    if (product && selectedVariant) {
      const availableQuantity = selectedVariant.inventory_quantity;
      try {
        await addToCart(product, selectedVariant, quantity, availableQuantity);
        toast({
          title: "Added to Cart! 🛒",
          description: `${quantity} x ${product.title} (${selectedVariant.title}) added.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Cannot add to cart",
          description: error.message,
        });
      }
    }
  }, [product, selectedVariant, quantity, addToCart, toast]);

  const handleQuantityChange = useCallback((amount) => {
    setQuantity(prevQuantity => {
        const newQuantity = prevQuantity + amount;
        if (newQuantity < 1) return 1;
        return newQuantity;
    });
  }, []);

  const handlePrevImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
    }
  }, [product?.images?.length]);

  const handleNextImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
    }
  }, [product?.images?.length]);

  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);

    if (variant.image_url && product?.images?.length > 0) {
      const imageIndex = product.images.findIndex(image => image.url === variant.image_url);

      if (imageIndex !== -1) {
        setCurrentImageIndex(imageIndex);
      }
    }
  }, [product?.images]);

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProduct = await getProduct(id);

        try {
          const quantitiesResponse = await getProductQuantities({
            fields: 'inventory_quantity',
            product_ids: [fetchedProduct.id]
          });

          const variantQuantityMap = new Map();
          quantitiesResponse.variants.forEach(variant => {
            variantQuantityMap.set(variant.id, variant.inventory_quantity);
          });

          const productWithQuantities = {
            ...fetchedProduct,
            variants: fetchedProduct.variants.map(variant => ({
              ...variant,
              inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
            }))
          };

          setProduct(productWithQuantities);

          if (productWithQuantities.variants && productWithQuantities.variants.length > 0) {
            setSelectedVariant(productWithQuantities.variants[0]);
          }
        } catch (quantityError) {
          throw quantityError;
        }
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate]);

  const brand = useMemo(() => {
    if (!product) return 'Premium';
    const firstWord = product.title.split(' ')[0].toLowerCase();
    if (['adidas', 'nike', 'puma', 'reebok', 'new'].includes(firstWord)) {
      return product.title.split(' ')[0];
    }
    return 'Premium';
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-12 w-12 text-slate-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-grow max-w-5xl mx-auto w-full px-4 py-12">
          <Link to="/products" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8 font-medium">
            <ArrowLeft size={16} />
            Back to Products
          </Link>
          <div className="text-center text-red-500 p-12 bg-red-50 rounded-3xl border border-red-100">
            <XCircle className="mx-auto h-16 w-16 mb-4 text-red-400" />
            <p className="text-lg font-medium">Error loading product: {error}</p>
            <Button onClick={() => navigate('/products')} className="mt-6 rounded-full">Return to Catalog</Button>
          </div>
        </div>
      </div>
    );
  }

  const price = selectedVariant?.sale_price_formatted ?? selectedVariant?.price_formatted;
  const originalPrice = selectedVariant?.price_formatted;
  const availableStock = selectedVariant ? selectedVariant.inventory_quantity : 0;
  const isStockManaged = selectedVariant?.manage_inventory ?? false;
  const canAddToCart = !isStockManaged || quantity <= availableStock;

  const currentImage = product.images[currentImageIndex];
  const hasMultipleImages = product.images.length > 1;

  return (
    <>
      <Helmet>
        <title>{product.title} - Scarpa Shoes</title>
        <meta name="description" content={product.description?.substring(0, 160) || product.title} />
      </Helmet>
      
      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumbs */}
          <nav className="flex text-sm text-slate-500 mb-8 font-medium">
            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-slate-900 transition-colors">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 truncate max-w-[200px] sm:max-w-none">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }} 
              className="flex flex-col gap-4"
            >
              {/* Main Image */}
              <div 
                className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 cursor-zoom-in group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={!currentImage?.url ? placeholderImage : currentImage.url}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-transform duration-200 ${isZoomed ? 'scale-[2]' : 'scale-100'}`}
                    style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {hasMultipleImages && !isZoomed && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-sm uppercase tracking-wider">
                    {product.category || 'Shoes'}
                  </div>
                  {product.ribbon_text && (
                    <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md uppercase tracking-wider">
                      {product.ribbon_text}
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {hasMultipleImages && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? 'border-slate-900 shadow-md' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={!image.url ? placeholderImage : image.url}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover bg-slate-50"
                      />
                      {index !== currentImageIndex && <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors" />}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Details Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: 0.2 }} 
              className="flex flex-col"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{brand}</span>
                  <div className="flex items-center space-x-1 bg-slate-50 px-3 py-1 rounded-full text-sm font-medium text-slate-700 border border-slate-100">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>4.8</span>
                    <span className="text-slate-400 ml-1">(124 reviews)</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">{product.title}</h1>
                <p className="text-lg text-slate-600">{product.subtitle}</p>
              </div>

              <div className="flex items-end gap-4 mb-8 pb-8 border-b border-slate-100">
                <span className="text-4xl font-black text-slate-900">{price}</span>
                {selectedVariant?.sale_price_in_cents && (
                  <span className="text-2xl text-slate-400 line-through font-medium mb-1">{originalPrice}</span>
                )}
              </div>

              {/* Variants / Sizes */}
              {product.variants.length > 1 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Select Size</h3>
                    <button className="text-sm text-slate-500 underline hover:text-slate-900 transition-colors">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {product.variants.map(variant => {
                      const isSelected = selectedVariant?.id === variant.id;
                      const isOutOfStock = variant.manage_inventory && variant.inventory_quantity <= 0;
                      
                      return (
                        <Button
                          key={variant.id}
                          variant="outline"
                          onClick={() => handleVariantSelect(variant)}
                          disabled={isOutOfStock}
                          className={`h-14 rounded-xl text-base font-semibold transition-all ${
                            isSelected 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                              : isOutOfStock
                                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'
                          }`}
                        >
                          {variant.title}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center justify-between border-2 border-slate-200 rounded-2xl p-1 w-full sm:w-40 h-16 bg-white">
                  <Button 
                    onClick={() => handleQuantityChange(-1)} 
                    variant="ghost" 
                    className="h-full w-12 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Minus size={20} />
                  </Button>
                  <span className="w-12 text-center text-slate-900 font-bold text-lg">{quantity}</span>
                  <Button 
                    onClick={() => handleQuantityChange(1)} 
                    variant="ghost" 
                    className="h-full w-12 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Plus size={20} />
                  </Button>
                </div>

                <Button 
                  onClick={handleAddToCart} 
                  size="lg" 
                  className="flex-1 h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={!canAddToCart || !product.purchasable}
                >
                  <ShoppingCart className="mr-3 h-6 w-6" /> 
                  {(!canAddToCart || !product.purchasable) ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>

              {/* Stock Status */}
              <div className="mb-8">
                {isStockManaged && canAddToCart && product.purchasable && (
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-2 bg-emerald-50 w-fit px-4 py-2 rounded-full">
                    <CheckCircle size={16} /> {availableStock} items available in stock
                  </p>
                )}
                {isStockManaged && !canAddToCart && product.purchasable && (
                   <p className="text-sm font-medium text-amber-600 flex items-center gap-2 bg-amber-50 w-fit px-4 py-2 rounded-full">
                    <XCircle size={16} /> Only {availableStock} left in stock
                  </p>
                )}
                {!product.purchasable && (
                    <p className="text-sm font-medium text-red-600 flex items-center gap-2 bg-red-50 w-fit px-4 py-2 rounded-full">
                      <XCircle size={16} /> Currently unavailable
                    </p>
                )}
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 py-6 border-y border-slate-100">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-700">
                    <Truck size={24} />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">Free Shipping</span>
                  <span className="text-xs text-slate-500">On orders over ₹5000</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-700">
                    <RotateCcw size={24} />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">30 Days Return</span>
                  <span className="text-xs text-slate-500">No questions asked</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-700">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">Secure Payment</span>
                  <span className="text-xs text-slate-500">100% safe checkout</span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Product Description</h3>
                <div className="text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>

              {/* Additional Info */}
              {product.additional_info?.length > 0 && (
                <div className="mt-10 space-y-6">
                  {product.additional_info
                    .sort((a, b) => a.order - b.order)
                    .map((info) => (
                      <div key={info.id} className="bg-slate-50 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-3">{info.title}</h3>
                        <div className="prose prose-sm prose-slate text-slate-600" dangerouslySetInnerHTML={{ __html: info.description }} />
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetailPage;