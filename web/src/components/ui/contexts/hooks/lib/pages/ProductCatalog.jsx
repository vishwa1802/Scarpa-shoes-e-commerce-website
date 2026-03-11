import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Filter, ShoppingCart, Search } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([1000, 20000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Get initial filters from URL
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (category) setSelectedCategories([category]);
    if (search) setSearchQuery(search);
    
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategories, priceRange, minRating, sortBy, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const records = await pb.collection('products').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setProducts(records);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Price range filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(p => (p.rating || 4.5) >= minRating);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created) - new Date(a.created));
        break;
    }

    setFilteredProducts(filtered);
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const ProductCard = ({ product }) => {
    // Derive brand from name
    const brand = (() => {
      const firstWord = product.name.split(' ')[0].toLowerCase();
      if (['adidas', 'nike', 'puma', 'reebok', 'new'].includes(firstWord)) {
        return product.name.split(' ')[0];
      }
      return 'Premium';
    })();

    const displayRating = product.rating || (4 + Math.random()).toFixed(1);

    return (
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-2xl overflow-hidden border-slate-100 bg-white flex flex-col h-full"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
          {product.images && product.images.length > 0 ? (
            <img
              src={pb.files.getUrl(product, product.images[0])}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <span className="text-slate-400 font-medium">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide uppercase border border-slate-100">
            {product.category}
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold tracking-widest uppercase px-4 py-2 border-2 border-white rounded-lg">Out of Stock</span>
            </div>
          )}
        </div>
        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{brand}</span>
            <div className="flex items-center space-x-1 bg-slate-50 px-2 py-0.5 rounded text-xs font-medium text-slate-700">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{displayRating}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-slate-700 transition-colors leading-tight">{product.name}</h3>
          <p className="text-sm text-slate-500 mb-4 line-clamp-1 flex-grow">{product.description || 'Premium footwear'}</p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
            <span className="text-xl font-extrabold text-slate-900">₹{product.price.toLocaleString()}</span>
            <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-slate-900 hover:bg-slate-800 text-white shadow-md">
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Products - Scarpa Shoes</title>
        <meta name="description" content="Browse our complete collection of premium shoes, boots, and slippers." />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Our Collection</h1>
            <p className="text-lg text-slate-600 max-w-2xl">Discover the perfect pair for every occasion. From high-performance running shoes to rugged outdoor boots.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <Card className="p-6 border-0 shadow-lg rounded-2xl bg-white">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <h2 className="font-bold text-lg flex items-center text-slate-900">
                      <Filter className="w-5 h-5 mr-2" />
                      Filters
                    </h2>
                    {(selectedCategories.length > 0 || priceRange[0] > 1000 || priceRange[1] < 20000 || minRating > 0 || searchQuery) && (
                      <button 
                        onClick={() => {
                          setSelectedCategories([]);
                          setPriceRange([1000, 20000]);
                          setMinRating(0);
                          setSearchQuery('');
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4">Category</h3>
                    <div className="space-y-3">
                      {['Shoes', 'Boots', 'Slippers'].map(category => (
                        <div key={category} className="flex items-center group">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                            className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                          />
                          <Label htmlFor={category} className="ml-3 cursor-pointer text-slate-600 group-hover:text-slate-900 transition-colors">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4">Price Range</h3>
                    <Slider
                      min={1000}
                      max={20000}
                      step={500}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-4"
                    />
                    <div className="flex justify-between items-center">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">
                        ₹{priceRange[0]}
                      </div>
                      <span className="text-slate-400">-</span>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">
                        ₹{priceRange[1]}
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-slate-900 mb-4">Minimum Rating</h3>
                    <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
                      <SelectTrigger className="w-full rounded-xl border-slate-200 focus:ring-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Ratings</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sort and Results Count */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-slate-600 font-medium px-2">
                  Showing <span className="text-slate-900 font-bold">{filteredProducts.length}</span> results
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm text-slate-500 font-medium hidden sm:block">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 rounded-xl border-slate-200 focus:ring-slate-900 bg-slate-50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest Arrivals</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                      <div className="bg-slate-100 aspect-[4/5] rounded-xl mb-4"></div>
                      <div className="h-4 bg-slate-100 rounded w-1/4 mb-3"></div>
                      <div className="h-5 bg-slate-100 rounded w-3/4 mb-4"></div>
                      <div className="h-6 bg-slate-100 rounded w-1/3 mt-auto"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-red-100">
                  <p className="text-red-600 mb-4 font-medium">{error}</p>
                  <Button onClick={fetchProducts} variant="outline" className="rounded-full">Try Again</Button>
                </div>
              )}

              {/* Products Grid */}
              {!loading && !error && (
                <>
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                      <p className="text-slate-500 mb-8 max-w-md mx-auto">We couldn't find any products matching your current filters. Try adjusting your search criteria.</p>
                      <Button 
                        onClick={() => {
                          setSelectedCategories([]);
                          setPriceRange([1000, 20000]);
                          setMinRating(0);
                          setSearchQuery('');
                        }}
                        className="rounded-full px-8 bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCatalog;