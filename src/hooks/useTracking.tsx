import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export interface UserActivity {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  pageViews: Array<{
    path: string;
    timestamp: Date;
    duration: number;
  }>;
  productViews: Array<{
    productId: string;
    timestamp: Date;
    duration: number;
    category: string;
  }>;
  interactions: Array<{
    type: 'click' | 'scroll' | 'search' | 'add_to_cart' | 'purchase';
    target: string;
    timestamp: Date;
    metadata: any;
  }>;
  preferences: {
    viewedCategories: string[];
    priceRange: { min: number; max: number };
    preferredBrands: string[];
    lastActive: Date;
  };
}

export interface SuspiciousActivity {
  type: 'rapid_clicks' | 'bot_pattern' | 'sensitive_access' | 'multiple_accounts';
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  details: string;
}

class TrackingService {
  private static instance: TrackingService;
  private userId: string;
  private sessionId: string;
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';
  private activityQueue: any[] = [];
  private isFlushing = false;
  private warningShown = false;

  private constructor() {
    this.userId = localStorage.getItem('user_id') || uuidv4();
    this.sessionId = uuidv4();
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    localStorage.setItem('user_id', this.userId);
    this.initializeSession();
  }

  static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  private async initializeSession() {
    const ipData = await this.getIPData();
    const initialActivity: Partial<UserActivity> = {
      userId: this.userId,
      sessionId: this.sessionId,
      ipAddress: ipData.ip,
      userAgent: navigator.userAgent,
      pageViews: [],
      productViews: [],
      interactions: [],
      preferences: {
        viewedCategories: [],
        priceRange: { min: 0, max: 0 },
        preferredBrands: [],
        lastActive: new Date()
      }
    };

    localStorage.setItem('user_data', JSON.stringify(initialActivity));
    this.flushQueue();
  }

  private async getIPData() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return { ip: data.ip };
    } catch {
      return { ip: 'unknown' };
    }
  }

  async trackPageView(path: string, duration?: number) {
    const activity = {
      type: 'page_view',
      path,
      timestamp: new Date(),
      duration: duration || 0,
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.activityQueue.push(activity);
    await this.checkSuspiciousActivity(activity);
    this.flushQueue();
  }

  async trackProductView(productId: string, category: string, duration: number) {
    const activity = {
      type: 'product_view',
      productId,
      category,
      timestamp: new Date(),
      duration,
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.activityQueue.push(activity);
    this.updateUserPreferences(productId, category);
    this.flushQueue();
  }

  async trackInteraction(type: string, target: string, metadata?: any) {
    const activity = {
      type,
      target,
      timestamp: new Date(),
      metadata,
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.activityQueue.push(activity);
    await this.checkSuspiciousActivity(activity);
    this.flushQueue();
  }

  private updateUserPreferences(productId: string, category: string) {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    if (!userData.preferences.viewedCategories.includes(category)) {
      userData.preferences.viewedCategories.push(category);
    }
    
    userData.preferences.lastActive = new Date();
    localStorage.setItem('user_data', JSON.stringify(userData));
  }

  private async checkSuspiciousActivity(activity: any): Promise<SuspiciousActivity | null> {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const recentActivities = this.activityQueue.filter(
      a => new Date().getTime() - new Date(a.timestamp).getTime() < 5000
    );

    // Check for rapid clicks (potential bot)
    if (recentActivities.filter(a => a.type === 'click').length > 20) {
      const suspicious: SuspiciousActivity = {
        type: 'rapid_clicks',
        severity: 'high',
        timestamp: new Date(),
        details: 'Excessive clicking detected'
      };
      
      await this.handleSuspiciousActivity(suspicious);
      return suspicious;
    }

    // Check for sensitive path access
    const sensitivePaths = ['/admin', '/dashboard', '/user-data'];
    if (sensitivePaths.some(path => activity.path?.includes(path))) {
      const suspicious: SuspiciousActivity = {
        type: 'sensitive_access',
        severity: 'high',
        timestamp: new Date(),
        details: `Attempted access to sensitive path: ${activity.path}`
      };
      
      await this.handleSuspiciousActivity(suspicious);
      return suspicious;
    }

    return null;
  }

  private async handleSuspiciousActivity(activity: SuspiciousActivity) {
    // Send to backend for analysis
    await this.sendToOpenAI(activity);
    
    // Show warning to user (only once)
    if (!this.warningShown && activity.severity === 'high') {
      this.showWarning(activity);
      this.warningShown = true;
    }
    
    // If multiple high severity activities, ban account
    const warnings = parseInt(localStorage.getItem('suspicious_warnings') || '0');
    if (warnings >= 2) {
      this.banAccount();
    } else {
      localStorage.setItem('suspicious_warnings', (warnings + 1).toString());
    }
  }

  private showWarning(activity: SuspiciousActivity) {
    const warningModal = document.createElement('div');
    warningModal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
          <h3 style="color: #dc2626; margin-bottom: 1rem;">⚠️ Security Warning</h3>
          <p style="margin-bottom: 1.5rem;">Suspicious activity detected. Please refrain from automated actions.</p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #dc2626;
            color: white;
            border: none;
            padding: 0.5rem 2rem;
            border-radius: 6px;
            cursor: pointer;
          ">I Understand</button>
        </div>
      </div>
    `;
    document.body.appendChild(warningModal);
  }

  private banAccount() {
    localStorage.setItem('account_banned', 'true');
    window.location.href = '/banned';
  }

  private async sendToOpenAI(data: any) {
    if (!this.apiKey) return;

    try {
      await fetch(`${this.baseURL}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'Analyze this user activity for suspicious patterns:'
          }, {
            role: 'user',
            content: JSON.stringify(data)
          }]
        })
      });
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }

  private async flushQueue() {
    if (this.isFlushing || this.activityQueue.length === 0) return;
    
    this.isFlushing = true;
    
    // Send to your backend (replace with your API endpoint)
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.activityQueue)
      });
      this.activityQueue = [];
    } catch (error) {
      console.error('Failed to send tracking data:', error);
    }
    
    this.isFlushing = false;
  }

  getUserPreferences() {
    const data = JSON.parse(localStorage.getItem('user_data') || '{}');
    return data.preferences || {
      viewedCategories: [],
      priceRange: { min: 0, max: 0 },
      preferredBrands: [],
      lastActive: new Date()
    };
  }

  getRecommendations(products: any[]) {
    const preferences = this.getUserPreferences();
    
    if (preferences.viewedCategories.length === 0) {
      // New user - show trending products
      return products
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 8);
    }
    
    // Experienced user - show personalized recommendations
    return products
      .filter(p => 
        preferences.viewedCategories.includes(p.category) ||
        preferences.preferredBrands.includes(p.brand)
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);
  }
}

export const useTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tracker] = useState(() => TrackingService.getInstance());

  useEffect(() => {
    const startTime = Date.now();
    
    tracker.trackPageView(location.pathname);
    
    return () => {
      const duration = Date.now() - startTime;
      tracker.trackPageView(location.pathname, duration);
    };
  }, [location.pathname, tracker]);

  const trackProductView = useCallback((productId: string, category: string, duration: number) => {
    tracker.trackProductView(productId, category, duration);
  }, [tracker]);

  const trackInteraction = useCallback((type: string, target: string, metadata?: any) => {
    tracker.trackInteraction(type, target, metadata);
  }, [tracker]);

  const getRecommendations = useCallback((products: any[]) => {
    return tracker.getRecommendations(products);
  }, [tracker]);

  return {
    trackProductView,
    trackInteraction,
    getRecommendations,
    getUserPreferences: () => tracker.getUserPreferences()
  };
};
