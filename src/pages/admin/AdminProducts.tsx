import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Cropper from 'react-easy-crop';
import { 
  Package, Plus, Edit2, Trash2, Search, Grid, List, X, 
  Upload, Loader2, AlertTriangle, Image, GripVertical, Eye, EyeOff, Tags, Link as LinkIcon, Check
} from 'lucide-react';
import { useProductsFromDb, useCreateProduct, useUpdateProduct, useDeleteProduct, uploadProductImage, Product, ProductInsert } from '@/hooks/useProducts';
import { useAllHeroImages, useCreateHeroImage, useUpdateHeroImage, useDeleteHeroImage, uploadHeroImage, useUpdateHeroImagesOrder, HeroImage, HeroImageInsert } from '@/hooks/useHeroImages';
import { useAllCategoriesFromDb, useCreateCategory, useUpdateCategory, useDeleteCategory, uploadCategoryImage, Category } from '@/hooks/useCategories';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import gsap from 'gsap';

// --- UTILS FOR CROPPING ---
const readFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      // Create a File object from the Blob
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg');
  });
}

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
  '📱', '💻', '📟', '🎧', '⌚', '🔌', '🎮', '📷', '🖥️', '🔋', '💾', '🖨️',
  '📀', '🎤', '🎵', '🎬', '📺', '📡', '🔊', '💡', '🔧', '⚡', '🛒', '🎁',
  '🖱️', '⌨️', '🔦', '📻', '📹', '🎥', '📽️', '🎞️', '📼', '💿', '📲', '☎️',
  '🕹️', '👾', '🃏', '🎲', '🎯', '🏆', '🎪', '🎨', '🎭', '🎸', '🎹', '🎺',
  '🏠', '💡', '🔒', '🚿', '❄️', '🌡️', '⏰', '📶', '🔔', '🛋️', '🪑', '🛏️',
  '🎒', '👜', '👓', '🕶️', '💎', '💍', '👑', '🎩', '📦', '🗃️', '✨', '🌟'
];

const inputStyles = "bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all";

const AdminProducts: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHeroDialogOpen, setIsHeroDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- CROPPER STATES ---
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropAspect, setCropAspect] = useState(1); // 1 = Square, 16/9 = Hero
  const [cropTarget, setCropTarget] = useState<'product' | 'hero' | 'category' | null>(null);

  // --- PRODUCT STATES ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HERO STATES ---
  const [editingHero, setEditingHero] = useState<HeroImage | null>(null);
  const [deleteHeroId, setDeleteHeroId] = useState<string | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [draggedHeroId, setDraggedHeroId] = useState<string | null>(null);
  const [heroOrder, setHeroOrder] = useState<HeroImage[]>([]);

  // --- CATEGORY STATES ---
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryIcon, setCategoryIcon] = useState('📦');
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [useImageIcon, setUseImageIcon] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  // --- HOOKS ---
  const { data: products = [], isLoading } = useProductsFromDb();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const { data: heroImages = [], isLoading: isLoadingHeroes } = useAllHeroImages();
  const createHeroImage = useCreateHeroImage();
  const updateHeroImage = useUpdateHeroImage();
  const deleteHeroImage = useDeleteHeroImage();
  const updateHeroOrder = useUpdateHeroImagesOrder();

  const { data: categories = [], isLoading: isLoadingCategories } = useAllCategoriesFromDb();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  useEffect(() => {
    setHeroOrder(heroImages);
  }, [heroImages]);

  // --- FORMS DATA ---
  const [formData, setFormData] = useState<Partial<ProductInsert>>({
    name: '', description: '', price: 0, original_price: null, category: 'smartphones',
    image: null, stock_quantity: 0, low_stock_threshold: 10, sku: '',
    in_stock: true, featured: false, rating: 0, reviews: 0, colors: []
  });

  const [heroFormData, setHeroFormData] = useState<Partial<HeroImageInsert>>({
    title: '', subtitle: '', image: '',
    gradient: 'from-violet-600 via-purple-600 to-indigo-800',
    badge: 'New', link: '/products', sort_order: 0, is_active: true
  });

  // GSAP Animation
  useEffect(() => {
    gsap.fromTo('.product-item', 
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, [viewMode, products]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: 0, original_price: null, category: 'smartphones',
      image: null, stock_quantity: 0, low_stock_threshold: 10, sku: '',
      in_stock: true, featured: false, rating: 0, reviews: 0, colors: []
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  const resetHeroForm = () => {
    setHeroFormData({
      title: '', subtitle: '', image: '',
      gradient: 'from-violet-600 via-purple-600 to-indigo-800',
      badge: 'New', link: '/products', sort_order: heroImages.length, is_active: true
    });
    setHeroImageFile(null);
    setHeroImagePreview(null);
    setEditingHero(null);
  };

  // --- OPEN DIALOG HANDLERS ---
  const openCreateDialog = () => { resetForm(); setIsDialogOpen(true); };
  
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setImagePreview(product.image);
    setIsDialogOpen(true);
  };

  const openCreateHeroDialog = () => { resetHeroForm(); setIsHeroDialogOpen(true); };

  const openEditHeroDialog = (hero: HeroImage) => {
    setEditingHero(hero);
    setHeroFormData({ ...hero });
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

  // --- CROPPER HANDLERS ---

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const initiateCrop = async (file: File, target: 'product' | 'hero' | 'category', aspect: number) => {
    const imageDataUrl = await readFile(file);
    setCropImageSrc(imageDataUrl);
    setCropTarget(target);
    setCropAspect(aspect);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setIsCropperOpen(true);
  };

  const handleCroppedImage = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    try {
      const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedFile);

      if (cropTarget === 'product') {
        setImageFile(croppedFile);
        setImagePreview(previewUrl);
      } else if (cropTarget === 'hero') {
        setHeroImageFile(croppedFile);
        setHeroImagePreview(previewUrl);
      } else if (cropTarget === 'category') {
        setCategoryImageFile(croppedFile);
        setCategoryImagePreview(previewUrl);
        setUseImageIcon(true);
      }

      setIsCropperOpen(false);
      setCropImageSrc(null);
    } catch (e) {
      console.error(e);
    }
  };

  // --- FILE CHANGE HANDLERS (Intercepted by Cropper) ---
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1:1 Aspect ratio for products
      await initiateCrop(file, 'product', 1 / 1);
    }
    e.target.value = ''; // Reset input
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 16:9 Aspect ratio for hero banners
      await initiateCrop(file, 'hero', 16 / 9);
    }
    e.target.value = '';
  };

  const handleCategoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1:1 Aspect ratio for categories
      await initiateCrop(file, 'category', 1 / 1);
    }
    e.target.value = '';
  };

  // --- SUBMIT HANDLERS (Unchanged mostly) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }
      const productData = { ...formData, image: imageUrl };
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, updates: productData });
      } else {
        await createProduct.mutateAsync(productData as ProductInsert);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) { console.error(error); } finally { setIsUploading(false); }
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = heroFormData.image;
      if (heroImageFile) {
        const uploadedUrl = await uploadHeroImage(heroImageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }
      const heroData = { ...heroFormData, image: imageUrl || '' };
      if (editingHero) {
        await updateHeroImage.mutateAsync({ id: editingHero.id, updates: heroData as HeroImageInsert });
      } else {
        await createHeroImage.mutateAsync(heroData as HeroImageInsert);
      }
      setIsHeroDialogOpen(false);
      resetHeroForm();
    } catch (error) { console.error(error); } finally { setIsUploading(false); }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setIsUploading(true);
    try {
      let imageUrl = null;
      if (categoryImageFile) {
        const uploadedUrl = await uploadCategoryImage(categoryImageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      } else if (useImageIcon && categoryImagePreview) {
        imageUrl = categoryImagePreview;
      }
      const catData = { name: categoryName.toLowerCase(), icon: categoryIcon, image_url: useImageIcon ? imageUrl : null, sort_order: categories.length, is_active: true };
      
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, updates: { name: catData.name, icon: catData.icon, image_url: catData.image_url } });
      } else {
        await createCategory.mutateAsync(catData);
      }
      setIsCategoryDialogOpen(false);
    } catch (error) { console.error(error); } finally { setIsUploading(false); }
  };

  const handleDelete = async () => { if (deleteProductId) { await deleteProduct.mutateAsync(deleteProductId); setDeleteProductId(null); } };
  const handleDeleteHero = async () => { if (deleteHeroId) { await deleteHeroImage.mutateAsync(deleteHeroId); setDeleteHeroId(null); } };
  const handleDeleteCategory = async () => { if (deleteCategoryId) { await deleteCategory.mutateAsync(deleteCategoryId); setDeleteCategoryId(null); } };

  // --- DRAG AND DROP ---
  const handleDragStart = useCallback((e: React.DragEvent, heroId: string) => { setDraggedHeroId(heroId); e.dataTransfer.effectAllowed = 'move'; }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedHeroId || draggedHeroId === targetId) return;
    const newOrder = [...heroOrder];
    const draggedIndex = newOrder.findIndex(h => h.id === draggedHeroId);
    const targetIndex = newOrder.findIndex(h => h.id === targetId);
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      const updatedOrder = newOrder.map((hero, index) => ({ ...hero, sort_order: index }));
      setHeroOrder(updatedOrder);
      updateHeroOrder.mutateAsync(updatedOrder.map(h => ({ id: h.id, sort_order: h.sort_order })));
    }
    setDraggedHeroId(null);
  }, [draggedHeroId, heroOrder, updateHeroOrder]);
  const handleDragEnd = useCallback(() => { setDraggedHeroId(null); }, []);
  const toggleHeroActive = async (hero: HeroImage) => { await updateHeroImage.mutateAsync({ id: hero.id, updates: { is_active: !hero.is_active } }); };
  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return { label: 'Out of Stock', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    if (product.stock_quantity <= product.low_stock_threshold) return { label: 'Low Stock', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'In Stock', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Products Management</h1>
            <p className="text-gray-400 mt-1">Manage catalog, banners & categories</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full bg-[#1a1a1a] p-1.5 gap-2 rounded-full border border-white/5 grid grid-cols-3 h-auto">
            <TabsTrigger value="products" className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-400 py-2.5 transition-all"><Package className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Products</span><span className="sm:hidden">Prods</span></TabsTrigger>
            <TabsTrigger value="heroes" className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-400 py-2.5 transition-all"><Image className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Banners</span><span className="sm:hidden">Heroes</span></TabsTrigger>
            <TabsTrigger value="categories" className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-400 py-2.5 transition-all"><Tags className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Categories</span><span className="sm:hidden">Cats</span></TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-white/5 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all" />
              </div>
              <div className="flex gap-2">
                 <div className="bg-[#1a1a1a] p-1 rounded-full border border-white/5 flex">
                  <button onClick={() => setViewMode('grid')} className={`p-3 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}><Grid className="w-5 h-5" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-3 rounded-full transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}><List className="w-5 h-5" /></button>
                </div>
                <Button onClick={openCreateDialog} className="h-full rounded-full px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-500/25 transition-all"><Plus className="w-5 h-5 mr-2" /> Add Product</Button>
              </div>
            </div>
            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div> : filteredProducts.length === 0 ? <div className="text-center py-20"><Package className="w-16 h-16 mx-auto text-gray-600 mb-4" /><h3 className="text-xl font-medium text-white mb-2">No products found</h3></div> : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="product-item bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden group hover:border-orange-500/30 transition-all shadow-lg hover:shadow-orange-500/5">
                    <div className="relative aspect-square bg-[#222] p-6">
                       {p.image ? <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" /> : <div className="flex items-center justify-center h-full"><Package className="text-gray-700 w-12 h-12" /></div>}
                       <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"><button onClick={() => openEditDialog(p)} className="p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-blue-500"><Edit2 className="w-4 h-4" /></button><button onClick={() => setDeleteProductId(p.id)} className="p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500"><Trash2 className="w-4 h-4" /></button></div>
                    </div>
                    <div className="p-5"><h3 className="font-semibold text-white truncate">{p.name}</h3><div className="flex justify-between mt-2"><span className="text-lg font-bold text-orange-400">${p.price}</span><span className={`text-[10px] px-2 py-1 rounded-full border ${getStockStatus(p).color}`}>{getStockStatus(p).label}</span></div></div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
                <table className="w-full min-w-[600px]"><thead className="bg-black/20"><tr><th className="text-left p-5 text-xs text-gray-400 uppercase">Product</th><th className="p-5 text-xs text-gray-400 uppercase text-left">Category</th><th className="p-5 text-xs text-gray-400 uppercase text-left">Price</th><th className="p-5 text-xs text-gray-400 uppercase text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-white/5">{filteredProducts.map(p => (<tr key={p.id} className="hover:bg-white/5 product-item"><td className="p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-[#222] border border-white/5 overflow-hidden">{p.image ? <img src={p.image} className="w-full h-full object-contain" /> : <Package className="w-5 h-5 m-auto text-gray-600" />}</div><span className="text-white font-medium">{p.name}</span></td><td className="p-5 text-gray-400 capitalize">{p.category}</td><td className="p-5 text-white font-mono">${p.price}</td><td className="p-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditDialog(p)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-full"><Edit2 className="w-4 h-4" /></button><button onClick={() => setDeleteProductId(p.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-full"><Trash2 className="w-4 h-4" /></button></div></td></tr>))}</tbody></table>
               </div>
            )}
          </TabsContent>

          {/* HERO TAB */}
          <TabsContent value="heroes" className="mt-8">
             <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-semibold text-white">Homepage Banners</h2><Button onClick={openCreateHeroDialog} className="rounded-full bg-orange-500 hover:bg-orange-600"><Plus className="w-4 h-4 mr-2" /> New Banner</Button></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{heroOrder.map((h, i) => (<div key={h.id} draggable onDragStart={(e) => handleDragStart(e, h.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, h.id)} onDragEnd={handleDragEnd} className={`relative bg-gradient-to-br ${h.gradient} rounded-3xl overflow-hidden group cursor-move shadow-xl ${!h.is_active ? 'grayscale opacity-50' : ''} ${draggedHeroId === h.id ? 'ring-4 ring-orange-500 scale-95' : ''} transition-all`}><div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" /><div className="relative p-6 flex items-center gap-5"><div className="p-2 bg-white/10 rounded-full cursor-grab"><GripVertical className="text-white w-5 h-5" /></div><div className="w-24 h-16 rounded-xl bg-black/20 overflow-hidden flex-shrink-0"><img src={h.image} className="w-full h-full object-cover" /></div><div className="flex-1 min-w-0"><h3 className="font-bold text-white truncate">{h.title}</h3><p className="text-white/70 text-sm truncate">{h.subtitle}</p></div></div><div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => toggleHeroActive(h)} className="p-2 bg-black/30 rounded-full text-white hover:bg-white/20">{h.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button><button onClick={() => openEditHeroDialog(h)} className="p-2 bg-black/30 rounded-full text-white hover:bg-blue-500"><Edit2 className="w-4 h-4" /></button><button onClick={() => setDeleteHeroId(h.id)} className="p-2 bg-black/30 rounded-full text-white hover:bg-red-500"><Trash2 className="w-4 h-4" /></button></div></div>))}</div>
          </TabsContent>

          {/* CATEGORY TAB */}
          <TabsContent value="categories" className="mt-8">
            <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-semibold text-white">Categories</h2><Button onClick={openCreateCategoryDialog} className="rounded-full bg-orange-500 hover:bg-orange-600"><Plus className="w-4 h-4 mr-2" /> Add Category</Button></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">{categories.map(c => (<div key={c.id} onClick={() => openEditCategoryDialog(c)} className="relative flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-[#1a1a1a] border border-white/5 hover:bg-[#222] cursor-pointer group transition-all">{c.image_url ? <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform"><img src={c.image_url} className="w-full h-full object-cover" /></div> : <span className="text-5xl group-hover:scale-110 transition-transform">{c.icon}</span>}<span className="text-sm font-medium text-white capitalize">{c.name}</span><button onClick={(e) => {e.stopPropagation(); setDeleteCategoryId(c.id)}} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white/50 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3 h-3" /></button></div>))}</div>
          </TabsContent>
        </Tabs>

        {/* --- CROPPER DIALOG --- */}
        <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
          <DialogContent className="w-[95vw] max-w-xl bg-[#181818] border-white/10 p-0 overflow-hidden rounded-[2rem] flex flex-col h-[80vh]">
            <DialogHeader className="p-6 bg-[#1a1a1a] border-b border-white/5 z-10 relative">
              <DialogTitle className="text-white">Adjust Image</DialogTitle>
            </DialogHeader>
            <div className="relative flex-1 bg-black w-full h-full">
               {cropImageSrc && (
                 <Cropper
                   image={cropImageSrc}
                   crop={crop}
                   zoom={zoom}
                   aspect={cropAspect}
                   onCropChange={setCrop}
                   onCropComplete={onCropComplete}
                   onZoomChange={setZoom}
                   classes={{
                      containerClassName: 'rounded-b-[2rem]' 
                   }}
                 />
               )}
            </div>
            <div className="p-6 bg-[#1a1a1a] border-t border-white/5 z-10 relative space-y-4">
               <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 w-10">Zoom</span>
                  <Slider 
                    value={[zoom]} 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    onValueChange={(val) => setZoom(val[0])} 
                    className="flex-1"
                  />
               </div>
               <div className="flex justify-end gap-3">
                 <Button variant="ghost" onClick={() => setIsCropperOpen(false)} className="rounded-full text-gray-400 hover:bg-white/5">Cancel</Button>
                 <Button onClick={handleCroppedImage} className="rounded-full bg-orange-500 hover:bg-orange-600"><Check className="w-4 h-4 mr-2" /> Done</Button>
               </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* --- PRODUCT FORM --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto bg-[#181818] border-white/10 p-6 rounded-[2rem]">
            <DialogHeader><DialogTitle className="text-2xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
               <div className="space-y-3"><Label className="text-gray-300">Product Image</Label><div className="flex gap-4 items-center"><div onClick={() => fileInputRef.current?.click()} className="w-28 h-28 rounded-2xl bg-[#222] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all overflow-hidden flex-shrink-0 relative">{imagePreview ? <img src={imagePreview} className="w-full h-full object-contain" /> : <Upload className="w-8 h-8 text-gray-500" />}</div><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></div></div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2"><Label className="text-gray-300">Name</Label><Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className={inputStyles} required /></div>
                  <div className="col-span-2 space-y-2"><Label className="text-gray-300">Description</Label><Textarea value={formData.description || ''} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className={inputStyles} /></div>
                  <div className="space-y-2"><Label className="text-gray-300">Price</Label><Input type="number" value={formData.price} onChange={e => setFormData(p => ({...p, price: parseFloat(e.target.value) || 0}))} className={inputStyles} required /></div>
                  <div className="space-y-2"><Label className="text-gray-300">Category</Label><Select value={formData.category} onValueChange={v => setFormData(p => ({...p, category: v}))}><SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger><SelectContent className="bg-[#222] border-white/10 text-white">{productCategories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label className="text-gray-300">Stock</Label><Input type="number" value={formData.stock_quantity} onChange={e => setFormData(p => ({...p, stock_quantity: parseInt(e.target.value) || 0}))} className={inputStyles} required /></div>
                  <div className="space-y-2"><Label className="text-gray-300">SKU</Label><Input value={formData.sku || ''} onChange={e => setFormData(p => ({...p, sku: e.target.value}))} className={inputStyles} /></div>
               </div>
               <div className="flex justify-end gap-3 pt-4 border-t border-white/5"><Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full text-gray-400">Cancel</Button><Button type="submit" disabled={isUploading} className="rounded-full bg-orange-500 hover:bg-orange-600">{isUploading && <Loader2 className="animate-spin mr-2 w-4 h-4" />} Save</Button></div>
            </form>
          </DialogContent>
        </Dialog>

        {/* --- HERO FORM --- */}
        <Dialog open={isHeroDialogOpen} onOpenChange={setIsHeroDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl bg-[#181818] border-white/10 p-6 rounded-[2rem] max-h-[90vh] overflow-y-auto">
             <DialogHeader><DialogTitle className="text-2xl font-bold text-white">Banner Details</DialogTitle></DialogHeader>
             <form onSubmit={handleHeroSubmit} className="space-y-6 mt-4">
                <div className="space-y-2"><Label className="text-gray-300">Banner Image (16:9)</Label><div onClick={() => heroFileInputRef.current?.click()} className="w-full h-40 rounded-2xl bg-[#222] border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-orange-500/50 overflow-hidden relative">{heroImagePreview ? <img src={heroImagePreview} className="w-full h-full object-cover" /> : <Upload className="text-gray-500 w-8 h-8" />}</div><input ref={heroFileInputRef} type="file" onChange={handleHeroImageChange} className="hidden" /></div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 space-y-2"><Label className="text-gray-300">Title</Label><Input value={heroFormData.title} onChange={e => setHeroFormData(p => ({...p, title: e.target.value}))} className={inputStyles} required /></div>
                   <div className="col-span-2 space-y-2"><Label className="text-gray-300">Subtitle</Label><Input value={heroFormData.subtitle || ''} onChange={e => setHeroFormData(p => ({...p, subtitle: e.target.value}))} className={inputStyles} /></div>
                   <div className="space-y-2"><Label className="text-gray-300">Link URL</Label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><Input value={heroFormData.link || ''} onChange={e => setHeroFormData(p => ({...p, link: e.target.value}))} className={`${inputStyles} pl-10`} placeholder="/products" /></div></div>
                   <div className="space-y-2"><Label className="text-gray-300">Badge</Label><Input value={heroFormData.badge || ''} onChange={e => setHeroFormData(p => ({...p, badge: e.target.value}))} className={inputStyles} /></div>
                   <div className="space-y-2"><Label className="text-gray-300">Gradient</Label><Select value={heroFormData.gradient} onValueChange={v => setHeroFormData(p => ({...p, gradient: v}))}><SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger><SelectContent className="bg-[#222] border-white/10 text-white">{gradientOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
                   <div className="space-y-2"><Label className="text-gray-300">Order</Label><Input type="number" value={heroFormData.sort_order} onChange={e => setHeroFormData(p => ({...p, sort_order: parseInt(e.target.value) || 0}))} className={inputStyles} /></div>
                   <div className="col-span-2 flex items-center justify-between p-4 bg-[#222] rounded-xl border border-white/5"><div><Label className="text-white block">Active</Label><span className="text-xs text-gray-500">Show on home</span></div><Switch checked={heroFormData.is_active ?? true} onCheckedChange={c => setHeroFormData(p => ({...p, is_active: c}))} /></div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5"><Button type="button" variant="ghost" onClick={() => setIsHeroDialogOpen(false)} className="rounded-full text-gray-400">Cancel</Button><Button type="submit" disabled={isUploading} className="rounded-full bg-orange-500 hover:bg-orange-600">{isUploading && <Loader2 className="animate-spin mr-2 w-4 h-4" />} Save Banner</Button></div>
             </form>
          </DialogContent>
        </Dialog>

        {/* --- CATEGORY FORM --- */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
           <DialogContent className="w-[95vw] max-w-md bg-[#181818] border-white/10 p-6 rounded-[2rem]">
              <DialogHeader><DialogTitle className="text-white">Category</DialogTitle></DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-6">
                 <div className="flex justify-center mb-4"><div className="text-6xl p-4 bg-[#222] rounded-3xl border border-white/5">{useImageIcon && categoryImagePreview ? <img src={categoryImagePreview} className="w-16 h-16 object-cover rounded-xl" /> : categoryIcon}</div></div>
                 <div className="space-y-2"><Label className="text-gray-300">Name</Label><Input value={categoryName} onChange={e => setCategoryName(e.target.value)} className={inputStyles} required /></div>
                 <div className="bg-[#222] p-2 rounded-xl flex gap-2"><button type="button" onClick={() => setUseImageIcon(false)} className={`flex-1 py-2 rounded-lg text-sm ${!useImageIcon ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>Emoji</button><button type="button" onClick={() => setUseImageIcon(true)} className={`flex-1 py-2 rounded-lg text-sm ${useImageIcon ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>Image</button></div>
                 {!useImageIcon ? <div className="grid grid-cols-6 gap-2 h-32 overflow-y-auto p-2 bg-[#222] rounded-xl">{emojiOptions.map((e, i) => <button key={i} type="button" onClick={() => setCategoryIcon(e)} className={`text-xl p-2 rounded-lg hover:bg-white/10 ${categoryIcon === e ? 'bg-orange-500/20' : ''}`}>{e}</button>)}</div> : <div onClick={() => categoryFileInputRef.current?.click()} className="h-32 bg-[#222] rounded-xl border-dashed border-2 border-white/10 flex items-center justify-center cursor-pointer"><span className="text-gray-500 text-sm">Upload Icon</span><input ref={categoryFileInputRef} type="file" className="hidden" onChange={handleCategoryImageChange} /></div>}
                 <Button type="submit" disabled={isUploading} className="w-full rounded-full bg-orange-500 hover:bg-orange-600">{isUploading && <Loader2 className="animate-spin mr-2 w-4 h-4" />} Save</Button>
              </form>
           </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}><AlertDialogContent className="bg-[#181818] border-white/10 rounded-[2rem]"><AlertDialogHeader><AlertDialogTitle className="text-white">Delete Product?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-full border-white/10 text-gray-400">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="rounded-full bg-red-500">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}><AlertDialogContent className="bg-[#181818] border-white/10 rounded-[2rem]"><AlertDialogHeader><AlertDialogTitle className="text-white">Delete Category?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-full border-white/10 text-gray-400">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCategory} className="rounded-full bg-red-500">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        <AlertDialog open={!!deleteHeroId} onOpenChange={() => setDeleteHeroId(null)}><AlertDialogContent className="bg-[#181818] border-white/10 rounded-[2rem]"><AlertDialogHeader><AlertDialogTitle className="text-white">Delete Banner?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-full border-white/10 text-gray-400">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteHero} className="rounded-full bg-red-500">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;

