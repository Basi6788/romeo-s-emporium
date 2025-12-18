import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Package, Truck, CheckCircle, Clock, Search, Filter, ChevronDown, Mail, Eye } from 'lucide-react';
import gsap from 'gsap';
import { updateDbOrderStatus } from '@/lib/dbOrders';
import { sendOrderStatusUpdate } from '@/lib/orderNotifications';
import { useOrdersSubscription } from '@/hooks/useRealtimeOrders';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderData {
  id?: string;
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
  isDbOrder?: boolean;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Clock, label: 'Pending' },
  processing: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Package, label: 'Processing' },
  shipped: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Truck, label: 'Shipped' },
  delivered: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: CheckCircle, label: 'Delivered' },
};

const AdminOrders: React.FC = () => {
  // Use realtime subscription for database orders
  const { orders: realtimeOrders, loading } = useOrdersSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Map database orders to the expected format
  const allOrders: OrderData[] = realtimeOrders.map(o => ({
    id: o.id,
    customerName: o.customer_name,
    email: o.email,
    phone: o.phone || '',
    address: o.address || '',
    city: o.city || '',
    postalCode: o.postal_code || '',
    country: o.country || '',
    paymentMethod: o.payment_method || 'cod',
    items: o.items as any[],
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    tax: Number(o.tax),
    total: Number(o.total),
    status: o.status as OrderData['status'],
    createdAt: new Date(o.created_at),
    isDbOrder: true
  }));

  useEffect(() => {
    if (!loading && allOrders.length > 0) {
      gsap.fromTo('.order-row', 
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading, allOrders.length]);

  const updateOrderStatus = async (order: any, newStatus: OrderData['status']) => {
    if (!order.id) return;
    
    setUpdatingStatus(order.id);
    
    try {
      // Update in database
      await updateDbOrderStatus(order.id, newStatus);
      // Send email notification
      const result = await sendOrderStatusUpdate({
        id: order.id,
        userId: order.userId,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        city: order.city,
        postalCode: order.postalCode,
        country: order.country,
        paymentMethod: order.paymentMethod,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }, newStatus);
      
      if (result.success) {
        toast.success(`Order status updated to ${statusConfig[newStatus].label}. Email notification sent!`);
      } else {
        toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
        console.warn('Email notification failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Orders', value: allOrders.length.toString(), change: 'All time', icon: Package, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Pending', value: allOrders.filter(o => o.status === 'pending').length.toString(), change: 'Awaiting', icon: Clock, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Processing', value: allOrders.filter(o => o.status === 'processing').length.toString(), change: 'In progress', icon: Package, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Delivered', value: allOrders.filter(o => o.status === 'delivered').length.toString(), change: 'Completed', icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-white/10 rounded mb-4" />
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-white/10 rounded-2xl" />
              ))}
            </div>
            <div className="h-96 bg-white/10 rounded-2xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Orders Management</h1>
            <p className="text-gray-500 mt-1">Track and manage customer orders</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, icon: Icon, gradient }) => (
            <div key={label} className="bg-[#111111] rounded-2xl border border-white/5 p-5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xs text-gray-400 mt-1">{change}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by order ID, customer name, or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#111111] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-5 py-3 bg-[#111111] border border-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/10 transition-colors">
              <Filter className="w-5 h-5" />
              {statusFilter === 'all' ? 'All Status' : statusConfig[statusFilter]?.label}
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a1a1a] border-white/10">
              <DropdownMenuItem 
                onClick={() => setStatusFilter('all')}
                className="text-gray-300 hover:text-white focus:text-white focus:bg-white/10"
              >
                All Status
              </DropdownMenuItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className="text-gray-300 hover:text-white focus:text-white focus:bg-white/10"
                >
                  <config.icon className={`w-4 h-4 mr-2 ${config.color}`} />
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Orders Table */}
        <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">
                {allOrders.length === 0 ? 'No orders yet' : 'No orders match your search'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Order ID</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500 hidden md:table-cell">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status];
                    const StatusIcon = status.icon;
                    const isUpdating = updatingStatus === order.id;
                    
                    return (
                      <tr key={order.id} className="order-row border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-white text-sm">{order.id}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-white">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.email}</p>
                        </td>
                        <td className="p-4 text-gray-400 hidden md:table-cell">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger 
                              disabled={isUpdating}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.color} hover:opacity-80 transition-opacity ${isUpdating ? 'opacity-50' : ''}`}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {isUpdating ? 'Updating...' : status.label}
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1a1a1a] border-white/10">
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <DropdownMenuItem 
                                  key={key}
                                  onClick={() => updateOrderStatus(order, key as OrderData['status'])}
                                  disabled={order.status === key}
                                  className={`text-gray-300 hover:text-white focus:text-white focus:bg-white/10 ${order.status === key ? 'opacity-50' : ''}`}
                                >
                                  <config.icon className={`w-4 h-4 mr-2 ${config.color}`} />
                                  {config.label}
                                  {order.status === key && <span className="ml-auto text-xs text-gray-500">Current</span>}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white">${order.total.toFixed(2)}</span>
                          <p className="text-xs text-gray-500">{order.items.length} items</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
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
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-[#111111] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              Order Details
              <span className="font-mono text-sm text-gray-400">{selectedOrder?.id}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Customer</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-400">{selectedOrder.email}</p>
                  <p className="text-sm text-gray-400">{selectedOrder.phone}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Shipping Address</p>
                  <p className="font-medium">{selectedOrder.address}</p>
                  <p className="text-sm text-gray-400">{selectedOrder.city}, {selectedOrder.postalCode}</p>
                  <p className="text-sm text-gray-400">{selectedOrder.country}</p>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-3">Update Status & Send Notification</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const isActive = selectedOrder.status === key;
                    const isUpdating = updatingStatus === selectedOrder.id;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (!isActive && selectedOrder) {
                            updateOrderStatus(selectedOrder, key as OrderData['status']);
                            setSelectedOrder({ ...selectedOrder, status: key as OrderData['status'] });
                          }
                        }}
                        disabled={isActive || isUpdating}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive 
                            ? `${config.bg} ${config.color} ring-2 ring-current` 
                            : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
                        } ${isUpdating ? 'opacity-50' : ''}`}
                      >
                        <config.icon className="w-4 h-4" />
                        {config.label}
                        {isActive && <Mail className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Clicking a status will update the order and send an email notification to the customer.
                </p>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-sm text-gray-400 mb-3">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white/5 rounded-xl p-3">
                      <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span>{selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-orange-400">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
