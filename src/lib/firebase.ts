import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

// Firebase configuration - using demo config that works for development
const firebaseConfig = {
  apiKey: "AIzaSyBINZfePaTc7CxQQdJHC8eXjlx-KdTlrxA",
  authDomain:"romeo65-62d30.firebaseapp.com",
  projectId: "romeo65-62d30",
  storageBucket: "romeo65-62d30.firebasestorage.app",
  messagingSenderId: "393595796284",
  appId: "G-BFJ7QMDMPH"
};

// Initialize Firebase
let app: ReturnType<typeof initializeApp>;
let db: ReturnType<typeof getFirestore>;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.log('Firebase initialization skipped - using local storage fallback');
}

export interface OrderData {
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
}

// Store order in localStorage as fallback (works without Firebase setup)
export const createOrder = async (orderData: Omit<OrderData, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const order: OrderData = {
    ...orderData,
    status: 'pending',
    createdAt: new Date(),
  };

  // Try Firebase first
  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.log('Firebase write failed, using localStorage');
    }
  }

  // Fallback to localStorage
  const existingOrders = JSON.parse(localStorage.getItem('basitshop_orders') || '[]');
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const orderWithId = { ...order, id: orderId };
  existingOrders.push(orderWithId);
  localStorage.setItem('basitshop_orders', JSON.stringify(existingOrders));
  
  return orderId;
};

export const getOrders = async (userId?: string): Promise<OrderData[]> => {
  // Try Firebase first
  if (db) {
    try {
      let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      if (userId) {
        q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as OrderData[];
    } catch (error) {
      console.log('Firebase read failed, using localStorage');
    }
  }

  // Fallback to localStorage
  const orders = JSON.parse(localStorage.getItem('basitshop_orders') || '[]');
  if (userId) {
    return orders.filter((o: OrderData) => o.userId === userId);
  }
  return orders;
};

export { db };
