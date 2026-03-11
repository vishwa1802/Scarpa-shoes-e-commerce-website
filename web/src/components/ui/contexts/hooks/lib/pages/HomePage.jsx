import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const showcaseProducts = [
  { id: 's1', name: 'Adidas Ultraboost Light', brand: 'Adidas', category: 'Shoes', price: 15999, image: 'https://images.unsplash.com/photo-1553266137-1a4c28aba92e' },
  { id: 's2', name: 'Adidas NMD_R1 Primeblue', brand: 'Adidas', category: 'Shoes', price: 14999, image: 'https://images.unsplash.com/photo-1671103597470-0b67bf89dcac' },
  { id: 's3', name: 'Nike Air Max 270', brand: 'Nike', category: 'Shoes', price: 16999, image: 'https://images.unsplash.com/photo-1598440441800-a7f71d3af0d7' },
  { id: 's4', name: 'Nike Air Zoom Pegasus', brand: 'Nike', category: 'Shoes', price: 13999, image: 'https://images.unsplash.com/photo-1599624007463-21e914ae0a26' },
  { id: 's5', name: 'Puma RS-X³ Puzzle', brand: 'Puma', category: 'Shoes', price: 11999, image: 'https://images.unsplash.com/photo-1595086646605-cfd198cda653' },
  { id: 's6', name: 'Puma Deviate Nitro', brand: 'Puma', category: 'Shoes', price: 12999, image: 'https://images.unsplash.com/photo-1702031975809-c18f6c27528d' },
  { id: 's7', name: 'Adidas Terrex Free Hiker', brand: 'Adidas', category: 'Boots', price: 18999, image: 'https://images.unsplash.com/photo-1684355414486-ff5930e943fb' },
  { id: 's8', name: 'Nike SFB Field 2', brand: 'Nike', category: 'Boots', price: 19999, image: 'https://images.unsplash.com/photo-1654722592404-a3c0b807cb11' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  
  const heroImages = [
    'https://images.unsplash.com/photo-1598692624760-980dcbfaec4a',
    'https://images.unsplash.com/photo-1686149507432-6ceec4a566ae'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    navigate(`/products?${params.toString()}`);
  };

  const ShowcaseCard = ({ product }) => (
    <Card 
      className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-2xl overflow-hidden border-slate-100 bg-white h-full flex flex-col"
      onClick={() => navigate(`/products?search=${product.brand}`)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
          {product.category}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-xl shadow-lg">
            View Details
          </Button>
        </div>
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{product.brand}</span>
          <div className="flex items-center space-x-1 bg-slate-50 px-2 py-0.5 rounded text-xs font-medium text-slate-700">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>4.8</span>
          </div>
        </div>
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg leading-tight">{product.name}</h3>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <span className="text-xl font-extrabold text-slate-900">₹{product.price.toLocaleString()}</span>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Scarpa Shoes - Premium Footwear Collection</title>
        <meta name="description" content="Shop premium shoes, boots, and slippers at Scarpa Shoes. Discover your perfect stride with our curated collection of high-quality footwear." />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900">
          {heroImages.map((img, index) => (
            <div 
              key={img}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroImage ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={img}
                alt="Premium footwear collection"
                className="w-full h-full object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            </div>
          ))}
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wider mb-6 uppercase">
                New Collection 2026
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                Step Into <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">Greatness.</span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-300 mb-10 font-light max-w-2xl leading-relaxed">
                Discover our curated selection of premium Adidas, Nike, and Puma footwear. Engineered for performance, designed for style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all duration-300 text-lg px-10 py-7 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] font-bold flex items-center gap-2"
                  onClick={() => navigate('/products')}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:text-white transition-all duration-300 text-lg px-10 py-7 rounded-full font-semibold"
                  onClick={() => {
                    document.getElementById('featured-showcase').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Brands
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search Bar Section */}
        <section className="py-8 bg-white border-b border-slate-100 relative z-20 shadow-sm">
          <div className="max-w-5xl mx-auto px-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for Adidas, Nike, Puma..."
                  className="w-full px-6 py-4 pl-12 text-slate-900 bg-slate-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-[56px] rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Shoes">Shoes</SelectItem>
                  <SelectItem value="Boots">Boots</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" size="lg" className="h-[56px] px-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg transition-colors">
                Search
              </Button>
            </form>
          </div>
        </section>

        {/* Featured Showcase Section */}
        <section id="featured-showcase" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Premium Showcase</h2>
                <p className="text-lg text-slate-600">Explore our handpicked selection of top-tier footwear from the world's leading brands.</p>
              </div>
              <Button 
                variant="outline" 
                className="rounded-full px-8 py-6 border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all font-semibold text-base"
                onClick={() => navigate('/products')}
              >
                View All Products <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {showcaseProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ShowcaseCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Banner */}
        <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1556906781-9a412961c28c')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Authorized Retailer</h2>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-70">
              <span className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Adidas</span>
              <span className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Nike</span>
              <span className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Puma</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-slate-900 font-bold text-lg">S</span>
                  </div>
                  Scarpa Shoes
                </h3>
                <p className="text-slate-400 max-w-md leading-relaxed">
                  Premium footwear for every occasion. We believe in quality, comfort, and style that lasts. Step into the future of footwear with Scarpa.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-6 text-slate-200">Quick Links</h3>
                <nav className="space-y-3">
                  <Link to="/products" className="block text-slate-400 hover:text-white transition-colors">All Products</Link>
                  <Link to="/products?category=Shoes" className="block text-slate-400 hover:text-white transition-colors">Shoes</Link>
                  <Link to="/products?category=Boots" className="block text-slate-400 hover:text-white transition-colors">Boots</Link>
                  <Link to="/about" className="block text-slate-400 hover:text-white transition-colors">About Us</Link>
                </nav>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-6 text-slate-200">Contact Us</h3>
                <div className="space-y-3 text-slate-400">
                  <p>Email: hello@scarpashoes.com</p>
                  <p>Phone: +91 12345 67890</p>
                  <p>Address: 123 Fashion Street, Style City, SC 12345</p>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
              <p>&copy; 2026 Scarpa Shoes. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;