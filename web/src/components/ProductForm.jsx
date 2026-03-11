import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ProductForm = ({ product, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Shoes',
    stock: '',
    rating: '0'
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || 'Shoes',
        stock: product.stock?.toString() || '',
        rating: product.rating?.toString() || '0'
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.price || !formData.stock) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', parseFloat(formData.price));
      data.append('category', formData.category);
      data.append('stock', parseInt(formData.stock));
      data.append('rating', parseFloat(formData.rating));

      // Add images
      images.forEach((image) => {
        data.append('images', image);
      });

      if (product) {
        // Update existing product
        await pb.collection('products').update(product.id, data, { $autoCancel: false });
        toast({
          title: 'Product Updated',
          description: 'Product has been successfully updated'
        });
      } else {
        // Create new product
        await pb.collection('products').create(data, { $autoCancel: false });
        toast({
          title: 'Product Created',
          description: 'Product has been successfully created'
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast({
        title: 'Too Many Images',
        description: 'Maximum 5 images allowed',
        variant: 'destructive'
      });
      return;
    }
    setImages(files);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              required
              className="text-gray-900"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={4}
              className="text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
                className="text-gray-900"
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                required
                className="text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shoes">Shoes</SelectItem>
                  <SelectItem value="Boots">Boots</SelectItem>
                  <SelectItem value="Slippers">Slippers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                placeholder="0.0"
                className="text-gray-900"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="images">Product Images (Max 5)</Label>
            <Input
              id="images"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageChange}
              className="text-gray-900"
            />
            {images.length > 0 && (
              <p className="text-sm text-slate-600 mt-2">
                {images.length} {images.length === 1 ? 'image' : 'images'} selected
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;