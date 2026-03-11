import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { getProducts, getProductQuantities } from '@/api/EcommerceApi';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const displayVariant = useMemo(() => product.variants[0], [product]);
  const hasSale = useMemo(() => displayVariant && displayVariant.sale_price_in_cents !== null, [displayVariant]);
  const displayPrice = useMemo(() => hasSale ? displayVariant.sale_price_formatted : displayVariant.price_formatted, [displayVariant, hasSale]);
  const originalPrice = useMemo(() => hasSale ? displayVariant.price_formatted : null, [displayVariant, hasSale]);

  // Derive brand from title for display purposes
  const brand = useMemo(() => {
    const firstWord = product.title.split(' ')[0].toLowerCase();
    if (['adidas', 'nike', 'puma', 'reebok', 'new'].includes(firstWord)) {
      return product.title.split(' ')[0];
    }
    return 'Premium';
  }, [product.title]);

  // Mock rating for display if not provided by API
  const rating = useMemo(() => (4 + Math.random()).toFixed(1), []);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants.length > 1) {
      navigate(`/product/${product.id}`);
      return;
    }

    const defaultVariant = product.variants[0];

    try {
      await addToCart(product, defaultVariant, 1, defaultVariant.inventory_quantity);
      toast({
        title: "Added to Cart! 🛒",
        description: `${product.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error adding to cart",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [product, addToCart, toast, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        <div className="h-full flex flex-col rounded-2xl bg-white text-slate-900 shadow-sm border border-slate-100 overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
            <img
              src={product.image || placeholderImage}
              alt={`Image of ${product.title}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide uppercase border border-slate-100">
              {product.category || 'Shoes'}
            </div>
            
            {product.ribbon_text && (
              <div className="absolute top-12 left-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md tracking-wide uppercase">
                {product.ribbon_text}
              </div>
            )}
            
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-slate-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-lg flex items-baseline gap-1.5 border border-slate-100">
              {hasSale && (
                <span className="line-through text-slate-400 text-xs font-medium">{originalPrice}</span>
              )}
              <span>{displayPrice}</span>
            </div>
          </div>
          
          <div className="p-5 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{brand}</span>
              <div className="flex items-center space-x-1 bg-slate-50 px-2 py-0.5 rounded text-xs font-medium text-slate-700">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-slate-700 transition-colors leading-tight">{product.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{product.subtitle || 'Premium quality footwear designed for comfort and style.'}</p>
            
            <Button 
              onClick={handleAddToCart} 
              className="w-full mt-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl py-6 transition-all active:scale-95 shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsWithQuantities = async () => {
      try {
        setLoading(true);
        setError(null);

        const productsResponse = await getProducts();

        if (productsResponse.products.length === 0) {
          setProducts([]);
          return;
        }

        const productIds = productsResponse.products.map(product => product.id);

        const quantitiesResponse = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: productIds
        });

        const variantQuantityMap = new Map();
        quantitiesResponse.variants.forEach(variant => {
          variantQuantityMap.set(variant.id, variant.inventory_quantity);
        });

        const productsWithQuantities = productsResponse.products.map(product => ({
          ...product,
          variants: product.variants.map(variant => ({
            ...variant,
            inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
          }))
        }));

        setProducts(productsWithQuantities);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsWithQuantities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-50 p-8 rounded-xl border border-red-100">
        <p className="font-medium">Error loading products: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-slate-500 bg-slate-50 p-12 rounded-xl border border-slate-100">
        <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <p className="text-lg font-medium">No products available at the moment.</p>
        <p className="text-sm mt-2">Please check back later for our new collection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductsList;