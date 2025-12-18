import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Package, Plus, Edit2, Trash2, Search, Grid, List, Eye, X, 
  Upload, Loader2, AlertTriangle 
} from 'lucide-react';
import { useProductsFromDb, useCreateProduct, useUpdateProduct, useDeleteProduct, uploadProductImage, Product, ProductInsert } from '@/hooks/useProducts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import gsap from 'gsap';

const categories = ['smartphones', 'laptops', 'tablets', 'audio', 'wearables', 'accessories', 'gaming', 'cameras'];

const AdminProducts: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useProductsFromDb();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formData, setFormData] = useState<Partial<ProductInsert>>({
    name: '',
    description: '',
    price: 0,
    original_price: null,
    category: 'smartphones',
    image: null,
    stock_quantity: 0,
    low_stock_threshold: 10,
    sku: '',
    in_stock: true,
    featured: false,
    rating: 0,
    reviews: 0,
    colors: []
  });

  useEffect(() => {
    gsap.fromTo('.product-item', 
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.7)' }
    );
  }, [viewMode, products]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      original_price: null,
      category: 'smartphones',
      image: null,
      stock_quantity: 0,
      low_stock_threshold: 10,
      sku: '',
      in_stock: true,
      featured: false,
      rating: 0,
      reviews: 0,
      colors: []
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      category: product.category,
      image: product.image,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      sku: product.sku || '',
      in_stock: product.in_stock ?? true,
      featured: product.featured ?? false,
      rating: product.rating ?? 0,
      reviews: product.reviews ?? 0,
      colors: product.colors || []
    });
    setImagePreview(product.image);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const productData: ProductInsert = {
        name: formData.name || '',
        description: formData.description || null,
        price: formData.price || 0,
        original_price: formData.original_price || null,
        category: formData.category || 'smartphones',
        image: imageUrl || null,
        stock_quantity: formData.stock_quantity || 0,
        low_stock_threshold: formData.low_stock_threshold || 10,
        sku: formData.sku || null,
        in_stock: formData.in_stock ?? true,
        featured: formData.featured ?? false,
        rating: formData.rating ?? 0,
        reviews: formData.reviews ?? 0,
        colors: formData.colors || []
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, updates: productData });
      } else {
        await createProduct.mutateAsync(productData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteProductId) {
      await deleteProduct.mutateAsync(deleteProductId);
      setDeleteProductId(null);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return { label: 'Out of Stock', color: 'text-red-400 bg-red-500/20' };
    if (product.stock_quantity <= product.low_stock_threshold) return { label: 'Low Stock', color: 'text-amber-400 bg-amber-500/20' };
    return { label: 'In Stock', color: 'text-emerald-400 bg-emerald-500/20' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Products Management</h1>
            <p className="text-gray-500 mt-1">Manage your product catalog ({products.length} products)</p>
          </div>
          <Button onClick={openCreateDialog} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-500/25">
            <Plus className="w-5 h-5" />
            Add Product
          </Button>
        </div>

        {/* Search & View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search products by name, category, or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#111111] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl border transition-colors ${viewMode === 'grid' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-[#111111] border-white/5 text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl border transition-colors ${viewMode === 'list' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-[#111111] border-white/5 text-gray-400 hover:text-white'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try a different search term' : 'Start by adding your first product'}
            </p>
            {!searchQuery && (
              <Button onClick={openCreateDialog} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <div 
                  key={product.id} 
                  className="product-item bg-[#111111] rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
                >
                  <div className="relative aspect-square bg-[#1a1a1a] p-4">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openEditDialog(product)}
                        className="p-2.5 bg-white/10 rounded-xl hover:bg-blue-500 transition-colors"
                      >
                        <Edit2 className="w-5 h-5 text-white" />
                      </button>
                      <button 
                        onClick={() => setDeleteProductId(product.id)}
                        className="p-2.5 bg-white/10 rounded-xl hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
                    <h3 className="font-medium text-white truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-orange-400">${product.price}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </div>
                    {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
                      <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Only {product.stock_quantity} left
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden md:table-cell">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden sm:table-cell">Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="product-item border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-white">{product.name}</span>
                            {product.sku && (
                              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400 capitalize hidden md:table-cell">{product.category}</td>
                      <td className="p-4">
                        <span className="font-bold text-orange-400">${product.price}</span>
                        {product.original_price && (
                          <span className="text-xs text-gray-500 line-through ml-2">${product.original_price}</span>
                        )}
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-full text-sm inline-flex items-center w-fit ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                          <span className="text-xs text-gray-500">{product.stock_quantity} units</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditDialog(product)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button 
                            onClick={() => setDeleteProductId(product.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111111] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="flex gap-4 items-start">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-xl bg-[#1a1a1a] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-red-400"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                      >
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-[#1a1a1a] border-white/10"
                    placeholder="iPhone 16 Pro Max"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-[#1a1a1a] border-white/10 min-h-[100px]"
                    placeholder="Product description..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    required
                    className="bg-[#1a1a1a] border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (for sale)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || null }))}
                    className="bg-[#1a1a1a] border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-[#1a1a1a] border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="bg-[#1a1a1a] border-white/10"
                    placeholder="ABC-123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                    required
                    className="bg-[#1a1a1a] border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 10 }))}
                    className="bg-[#1a1a1a] border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between col-span-2 p-4 bg-[#1a1a1a] rounded-xl">
                  <div>
                    <Label htmlFor="featured">Featured Product</Label>
                    <p className="text-xs text-gray-500">Show on homepage</p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.featured ?? false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading || createProduct.isPending || updateProduct.isPending}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {(isUploading || createProduct.isPending || updateProduct.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
          <AlertDialogContent className="bg-[#111111] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleteProduct.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
