import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Package, Plus, Edit2, Trash2, Search, Grid, List, X, 
  Upload, Loader2, AlertTriangle, Image, GripVertical, Eye, EyeOff, Tags
} from 'lucide-react';
import { useProductsFromDb, useCreateProduct, useUpdateProduct, useDeleteProduct, uploadProductImage, Product, ProductInsert } from '@/hooks/useProducts';
import { useAllHeroImages, useCreateHeroImage, useUpdateHeroImage, useDeleteHeroImage, uploadHeroImage, useUpdateHeroImagesOrder, HeroImage, HeroImageInsert } from '@/hooks/useHeroImages';
import { useAllCategoriesFromDb, useCreateCategory, useUpdateCategory, useDeleteCategory, uploadCategoryImage, Category } from '@/hooks/useCategories';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import gsap from 'gsap';

const productCategories = ['smartphones', 'laptops', 'tablets', 'audio', 'wearables', 'accessories', 'gaming', 'cameras'];

const gradientOptions = [
  { value: 'from-violet-600 via-purple-600 to-indigo-800', label: 'Purple' },
  { value: 'from-orange-500 via-rose-500 to-pink-600', label: 'Orange/Rose' },
  { value: 'from-emerald-500 via-teal-500 to-cyan-600', label: 'Emerald' },
  { value: 'from-slate-600 via-gray-700 to-zinc-900', label: 'Slate' },
  { value: 'from-blue-500 via-indigo-500 to-purple-600', label: 'Blue' },
  { value: 'from-red-500 via-orange-500 to-yellow-500', label: 'Sunset' },
];

const emojiOptions = [
  // Tech & Devices
  '📱', '💻', '📟', '🎧', '⌚', '🔌', '🎮', '📷', '🖥️', '🔋', '💾', '🖨️',
  '📀', '🎤', '🎵', '🎬', '📺', '📡', '🔊', '💡', '🔧', '⚡', '🛒', '🎁',
  // Additional Electronics
  '🖱️', '⌨️', '🔦', '📻', '📹', '🎥', '📽️', '🎞️', '📼', '💿', '📲', '☎️',
  // Gaming & Entertainment  
  '🕹️', '👾', '🃏', '🎲', '🎯', '🏆', '🎪', '🎨', '🎭', '🎸', '🎹', '🎺',
  // Smart Home
  '🏠', '💡', '🔒', '🚿', '❄️', '🌡️', '⏰', '📶', '🔔', '🛋️', '🪑', '🛏️',
  // Objects
  '🎒', '👜', '👓', '🕶️', '💎', '💍', '👑', '🎩', '📦', '🗃️', '✨', '🌟'
];

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

  // Hero Image states
  const [isHeroDialogOpen, setIsHeroDialogOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroImage | null>(null);
  const [deleteHeroId, setDeleteHeroId] = useState<string | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [draggedHeroId, setDraggedHeroId] = useState<string | null>(null);
  const [heroOrder, setHeroOrder] = useState<HeroImage[]>([]);

  // Category states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryIcon, setCategoryIcon] = useState('📦');
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [useImageIcon, setUseImageIcon] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useProductsFromDb();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Hero Image hooks
  const { data: heroImages = [], isLoading: isLoadingHeroes } = useAllHeroImages();
  const createHeroImage = useCreateHeroImage();
  const updateHeroImage = useUpdateHeroImage();
  const deleteHeroImage = useDeleteHeroImage();
  const updateHeroOrder = useUpdateHeroImagesOrder();

  // Category hooks
  const { data: categories = [], isLoading: isLoadingCategories } = useAllCategoriesFromDb();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  useEffect(() => {
    setHeroOrder(heroImages);
  }, [heroImages]);

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

  const [heroFormData, setHeroFormData] = useState<Partial<HeroImageInsert>>({
    title: '',
    subtitle: '',
    image: '',
    gradient: 'from-violet-600 via-purple-600 to-indigo-800',
    badge: 'New',
    link: '/products',
    sort_order: 0,
    is_active: true
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

  const resetHeroForm = () => {
    setHeroFormData({
      title: '',
      subtitle: '',
      image: '',
      gradient: 'from-violet-600 via-purple-600 to-indigo-800',
      badge: 'New',
      link: '/products',
      sort_order: heroImages.length,
      is_active: true
    });
    setHeroImageFile(null);
    setHeroImagePreview(null);
    setEditingHero(null);
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

  const openCreateHeroDialog = () => {
    resetHeroForm();
    setIsHeroDialogOpen(true);
  };

  const openEditHeroDialog = (hero: HeroImage) => {
    setEditingHero(hero);
    setHeroFormData({
      title: hero.title,
      subtitle: hero.subtitle || '',
      image: hero.image,
      gradient: hero.gradient,
      badge: hero.badge,
      link: hero.link,
      sort_order: hero.sort_order,
      is_active: hero.is_active
    });
    setHeroImagePreview(hero.image);
    setIsHeroDialogOpen(true);
  };

  const openCreateCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryIcon('📦');
    setCategoryImagePreview(null);
    setUseImageIcon(false);
    setCategoryImageFile(null);
    setIsCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon);
    setCategoryImagePreview(category.image_url || null);
    setUseImageIcon(!!category.image_url);
    setCategoryImageFile(null);
    setIsCategoryDialogOpen(true);
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryImageFile(file);
      setCategoryImagePreview(URL.createObjectURL(file));
      setUseImageIcon(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = formData.image;

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

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = heroFormData.image;

      if (heroImageFile) {
        const uploadedUrl = await uploadHeroImage(heroImageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const heroData: HeroImageInsert = {
        title: heroFormData.title || '',
        subtitle: heroFormData.subtitle || null,
        image: imageUrl || '',
        gradient: heroFormData.gradient || 'from-violet-600 via-purple-600 to-indigo-800',
        badge: heroFormData.badge || 'New',
        link: heroFormData.link || '/products',
        sort_order: heroFormData.sort_order || 0,
        is_active: heroFormData.is_active ?? true
      };

      if (editingHero) {
        await updateHeroImage.mutateAsync({ id: editingHero.id, updates: heroData });
      } else {
        await createHeroImage.mutateAsync(heroData);
      }

      setIsHeroDialogOpen(false);
      resetHeroForm();
    } catch (error) {
      console.error('Failed to save hero image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setIsUploading(true);

    try {
      let imageUrl: string | null = null;

      if (categoryImageFile) {
        const uploadedUrl = await uploadCategoryImage(categoryImageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      } else if (useImageIcon && categoryImagePreview) {
        imageUrl = categoryImagePreview;
      }

      if (editingCategory) {
        await updateCategory.mutateAsync({ 
          id: editingCategory.id, 
          updates: { 
            name: categoryName,
            icon: categoryIcon,
            image_url: useImageIcon ? imageUrl : null 
          } 
        });
      } else {
        await createCategory.mutateAsync({
          name: categoryName.toLowerCase(),
          icon: categoryIcon,
          image_url: useImageIcon ? imageUrl : null,
          sort_order: categories.length,
          is_active: true
        });
      }
      
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryName('');
      setCategoryImageFile(null);
      setCategoryImagePreview(null);
      setUseImageIcon(false);
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (deleteCategoryId) {
      await deleteCategory.mutateAsync(deleteCategoryId);
      setDeleteCategoryId(null);
    }
  };

  const handleDelete = async () => {
    if (deleteProductId) {
      await deleteProduct.mutateAsync(deleteProductId);
      setDeleteProductId(null);
    }
  };

  const handleDeleteHero = async () => {
    if (deleteHeroId) {
      await deleteHeroImage.mutateAsync(deleteHeroId);
      setDeleteHeroId(null);
    }
  };

  const toggleHeroActive = async (hero: HeroImage) => {
    await updateHeroImage.mutateAsync({
      id: hero.id,
      updates: { is_active: !hero.is_active }
    });
  };

  // Drag and drop handlers for hero banners
  const handleDragStart = useCallback((e: React.DragEvent, heroId: string) => {
    setDraggedHeroId(heroId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedHeroId || draggedHeroId === targetId) return;

    const newOrder = [...heroOrder];
    const draggedIndex = newOrder.findIndex(h => h.id === draggedHeroId);
    const targetIndex = newOrder.findIndex(h => h.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      
      const updatedOrder = newOrder.map((hero, index) => ({
        ...hero,
        sort_order: index
      }));
      
      setHeroOrder(updatedOrder);
      
      // Save to database
      updateHeroOrder.mutateAsync(
        updatedOrder.map(h => ({ id: h.id, sort_order: h.sort_order }))
      );
    }
    setDraggedHeroId(null);
  }, [draggedHeroId, heroOrder, updateHeroOrder]);

  const handleDragEnd = useCallback(() => {
    setDraggedHeroId(null);
  }, []);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Products Management</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your catalog, hero banners, and categories</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full bg-[#111111] border border-white/5 p-1 gap-1 grid grid-cols-3">
            <TabsTrigger value="products" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-xs sm:text-sm px-2 sm:px-4">
              <Package className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">Prods</span>
              <span className="ml-1">({products.length})</span>
            </TabsTrigger>
            <TabsTrigger value="heroes" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-xs sm:text-sm px-2 sm:px-4">
              <Image className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Hero Banners</span>
              <span className="sm:hidden">Heroes</span>
              <span className="ml-1">({heroImages.length})</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-xs sm:text-sm px-2 sm:px-4">
              <Tags className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Cats</span>
              <span className="ml-1">({categories.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            {/* Search & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                <Button onClick={openCreateDialog} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-500/25">
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Product</span>
                </Button>
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
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product);
                        return (
                          <tr key={product.id} className="border-b border-white/5 hover:bg-white/2 product-item">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                  ) : (
                                    <Package className="w-6 h-6 text-gray-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-white">{product.name}</p>
                                  <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-400 capitalize">{product.category}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm font-medium text-white">${product.price}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-400">{product.stock_quantity}</span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.color}`}>
                                {stockStatus.label}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-1">
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
              </div>
            )}
          </TabsContent>

          {/* Hero Banners Tab */}
          <TabsContent value="heroes" className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Manage homepage hero/banner images</p>
                <p className="text-gray-500 text-xs mt-1">Drag and drop to reorder banners</p>
              </div>
              <Button onClick={openCreateHeroDialog} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-500/25">
                <Plus className="w-5 h-5" />
                Add Banner
              </Button>
            </div>

            {isLoadingHeroes ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : heroOrder.length === 0 ? (
              <div className="text-center py-20 bg-[#111111] rounded-2xl border border-white/5">
                <Image className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No hero banners yet</h3>
                <p className="text-gray-500 mb-6">Add your first homepage banner</p>
                <Button onClick={openCreateHeroDialog} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" /> Add Banner
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroOrder.map((hero, index) => (
                  <div 
                    key={hero.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, hero.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, hero.id)}
                    onDragEnd={handleDragEnd}
                    className={`relative bg-gradient-to-br ${hero.gradient} rounded-2xl overflow-hidden group cursor-move ${!hero.is_active ? 'opacity-50' : ''} ${draggedHeroId === hero.id ? 'ring-2 ring-orange-500 scale-[0.98]' : ''} transition-all`}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
                          <img 
                            src={hero.image} 
                            alt={hero.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                            {hero.badge}
                          </span>
                          {!hero.is_active && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs">
                              Hidden
                            </span>
                          )}
                          <span className="text-white/50 text-xs">#{index + 1}</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white truncate">{hero.title}</h3>
                        <p className="text-white/70 text-sm truncate">{hero.subtitle}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleHeroActive(hero)}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        title={hero.is_active ? 'Hide banner' : 'Show banner'}
                      >
                        {hero.is_active ? (
                          <EyeOff className="w-4 h-4 text-white" />
                        ) : (
                          <Eye className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditHeroDialog(hero)}
                        className="p-2 bg-white/10 rounded-lg hover:bg-blue-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => setDeleteHeroId(hero.id)}
                        className="p-2 bg-white/10 rounded-lg hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Manage category icons displayed on homepage</p>
                <p className="text-gray-500 text-xs mt-1">Click on a category to edit it</p>
              </div>
              <Button onClick={openCreateCategoryDialog} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-20 bg-[#111111] rounded-2xl border border-white/5">
                <Tags className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No categories yet</h3>
                <p className="text-gray-500 mb-4">Create your first category to get started</p>
                <Button onClick={openCreateCategoryDialog} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
                  >
                    {category.image_url ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden group-hover:scale-110 transition-transform">
                        <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-4xl group-hover:scale-110 transition-transform">{category.icon}</span>
                    )}
                    <span className="text-sm font-medium text-white capitalize">{category.name}</span>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditCategoryDialog(category)}
                        className="p-1.5 bg-white/10 rounded-lg hover:bg-blue-500 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={() => setDeleteCategoryId(category.id)}
                        className="p-1.5 bg-white/10 rounded-lg hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create/Edit Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto bg-[#111111] border-white/10 p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-lg sm:text-xl">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm">Product Image</Label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-[#1a1a1a] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors overflow-hidden flex-shrink-0"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Click to upload</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-red-400 text-xs"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label htmlFor="name" className="text-sm">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-[#1a1a1a] border-white/10 text-sm"
                    placeholder="iPhone 16 Pro Max"
                  />
                </div>

                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-[#1a1a1a] border-white/10 min-h-[80px] sm:min-h-[100px] text-sm"
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
                      {productCategories.map(cat => (
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

                <div className="flex items-center justify-between col-span-1 sm:col-span-2 p-3 sm:p-4 bg-[#1a1a1a] rounded-xl">
                  <div>
                    <Label htmlFor="featured" className="text-sm">Featured Product</Label>
                    <p className="text-[10px] sm:text-xs text-gray-500">Show on homepage</p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.featured ?? false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="order-2 sm:order-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading || createProduct.isPending || updateProduct.isPending}
                  className="bg-orange-500 hover:bg-orange-600 order-1 sm:order-2"
                >
                  {(isUploading || createProduct.isPending || updateProduct.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create/Edit Hero Dialog */}
        <Dialog open={isHeroDialogOpen} onOpenChange={setIsHeroDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto bg-[#111111] border-white/10 p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-lg sm:text-xl">
                {editingHero ? 'Edit Hero Banner' : 'Create New Hero Banner'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleHeroSubmit} className="space-y-4 sm:space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm">Banner Image *</Label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start">
                  <div 
                    onClick={() => heroFileInputRef.current?.click()}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-[#1a1a1a] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors overflow-hidden flex-shrink-0"
                  >
                    {heroImagePreview ? (
                      <img src={heroImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageChange}
                    className="hidden"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-gray-400 mb-2">Click to upload</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                    {heroImagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-red-400 text-xs"
                        onClick={() => {
                          setHeroImageFile(null);
                          setHeroImagePreview(null);
                          setHeroFormData(prev => ({ ...prev, image: '' }));
                        }}
                      >
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label htmlFor="hero-title" className="text-sm">Title *</Label>
                  <Input
                    id="hero-title"
                    value={heroFormData.title}
                    onChange={(e) => setHeroFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="bg-[#1a1a1a] border-white/10 text-sm"
                    placeholder="iPhone 16 Pro"
                  />
                </div>

                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label htmlFor="hero-subtitle" className="text-sm">Subtitle</Label>
                  <Input
                    id="hero-subtitle"
                    value={heroFormData.subtitle || ''}
                    onChange={(e) => setHeroFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="bg-[#1a1a1a] border-white/10 text-sm"
                    placeholder="Extraordinary Visual & Power"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-badge">Badge</Label>
                  <Input
                    id="hero-badge"
                    value={heroFormData.badge || ''}
                    onChange={(e) => setHeroFormData(prev => ({ ...prev, badge: e.target.value }))}
                    className="bg-[#1a1a1a] border-white/10"
                    placeholder="New"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-link">Link</Label>
                  <Input
                    id="hero-link"
                    value={heroFormData.link || ''}
                    onChange={(e) => setHeroFormData(prev => ({ ...prev, link: e.target.value }))}
                    className="bg-[#1a1a1a] border-white/10"
                    placeholder="/products"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-gradient">Background Gradient</Label>
                  <Select 
                    value={heroFormData.gradient} 
                    onValueChange={(value) => setHeroFormData(prev => ({ ...prev, gradient: value }))}
                  >
                    <SelectTrigger className="bg-[#1a1a1a] border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded bg-gradient-to-r ${opt.value}`} />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-order">Sort Order</Label>
                  <Input
                    id="hero-order"
                    type="number"
                    min="0"
                    value={heroFormData.sort_order}
                    onChange={(e) => setHeroFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="bg-[#1a1a1a] border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between col-span-1 sm:col-span-2 p-3 sm:p-4 bg-[#1a1a1a] rounded-xl">
                  <div>
                    <Label htmlFor="hero-active" className="text-sm">Active</Label>
                    <p className="text-xs text-gray-500">Show on homepage</p>
                  </div>
                  <Switch
                    id="hero-active"
                    checked={heroFormData.is_active ?? true}
                    onCheckedChange={(checked) => setHeroFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </div>

              {/* Preview */}
              {heroFormData.title && (
                <div className="space-y-2">
                  <Label className="text-sm">Preview</Label>
                  <div className={`relative bg-gradient-to-br ${heroFormData.gradient} rounded-xl p-4 overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative flex items-center gap-4">
                      {heroImagePreview && (
                        <div className="w-16 h-16 rounded-lg bg-white/10 overflow-hidden">
                          <img src={heroImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                          {heroFormData.badge || 'New'}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">{heroFormData.title}</h3>
                        <p className="text-white/70 text-sm">{heroFormData.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setIsHeroDialogOpen(false)} className="order-2 sm:order-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading || createHeroImage.isPending || updateHeroImage.isPending || !heroFormData.title || (!heroImagePreview && !heroFormData.image)}
                  className="bg-orange-500 hover:bg-orange-600 order-1 sm:order-2"
                >
                  {(isUploading || createHeroImage.isPending || updateHeroImage.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingHero ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create/Edit Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="w-[95vw] max-w-lg bg-[#111111] border-white/10 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-lg sm:text-xl">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div className="text-center">
                {useImageIcon && categoryImagePreview ? (
                  <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden bg-[#1a1a1a] mb-4">
                    <img src={categoryImagePreview} alt="Icon" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-6xl mb-4">{categoryIcon}</div>
                )}
              </div>

              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="category-name" className="text-sm">Category Name *</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  className="bg-[#1a1a1a] border-white/10"
                  placeholder="e.g. smartphones, laptops"
                />
              </div>

              {/* Toggle between emoji and image */}
              <div className="flex items-center justify-center gap-4 p-3 bg-[#1a1a1a] rounded-xl">
                <button
                  type="button"
                  onClick={() => setUseImageIcon(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!useImageIcon ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                  Use Emoji
                </button>
                <button
                  type="button"
                  onClick={() => setUseImageIcon(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${useImageIcon ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                  Use Image
                </button>
              </div>

              {!useImageIcon ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">Select Emoji Icon</Label>
                    <div className="grid grid-cols-8 gap-1.5 p-3 bg-[#1a1a1a] rounded-xl max-h-40 overflow-y-auto">
                      {emojiOptions.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCategoryIcon(emoji)}
                          className={`text-xl p-1.5 rounded-lg hover:bg-white/10 transition-colors ${categoryIcon === emoji && !useImageIcon ? 'bg-orange-500/20 ring-2 ring-orange-500' : ''}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-icon" className="text-sm">Or enter custom emoji</Label>
                    <Input
                      id="custom-icon"
                      value={categoryIcon}
                      onChange={(e) => setCategoryIcon(e.target.value)}
                      className="bg-[#1a1a1a] border-white/10 text-center text-2xl"
                      maxLength={4}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm">Upload Custom Icon Image</Label>
                  <div className="flex flex-col items-center gap-4">
                    <div 
                      onClick={() => categoryFileInputRef.current?.click()}
                      className="w-32 h-32 rounded-xl bg-[#1a1a1a] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors overflow-hidden"
                    >
                      {categoryImagePreview ? (
                        <img src={categoryImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Click to upload</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={categoryFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageChange}
                      className="hidden"
                    />
                    {categoryImagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-400 text-xs"
                        onClick={() => {
                          setCategoryImageFile(null);
                          setCategoryImagePreview(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" /> Remove Image
                      </Button>
                    )}
                    <p className="text-xs text-gray-500 text-center">
                      Recommended: Square image (128x128px or larger)
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setIsCategoryDialogOpen(false)} className="order-2 sm:order-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading || createCategory.isPending || updateCategory.isPending || !categoryName.trim()}
                  className="bg-orange-500 hover:bg-orange-600 order-1 sm:order-2"
                >
                  {(isUploading || createCategory.isPending || updateCategory.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Product Confirmation */}
        <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
          <AlertDialogContent className="w-[90vw] max-w-md bg-[#111111] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-lg">Delete Product</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
              >
                {deleteProduct.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Hero Confirmation */}
        <AlertDialog open={!!deleteHeroId} onOpenChange={() => setDeleteHeroId(null)}>
          <AlertDialogContent className="w-[90vw] max-w-md bg-[#111111] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-lg">Delete Hero Banner</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to delete this banner? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteHero}
                className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
              >
                {deleteHeroImage.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Category Confirmation */}
        <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
          <AlertDialogContent className="w-[90vw] max-w-md bg-[#111111] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-lg">Delete Category</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to delete this category? Products using this category will not be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteCategory}
                className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
              >
                {deleteCategory.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
