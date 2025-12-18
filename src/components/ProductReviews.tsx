import React, { useState } from 'react';
import { Star, ThumbsUp, User, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface ProductReviewsProps {
  productId: string;
  productRating: number;
  reviewCount: number;
}

const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Ahmed Khan',
    rating: 5,
    comment: 'Excellent product! The quality exceeded my expectations. Fast delivery and great packaging. Highly recommended for anyone looking for premium quality.',
    date: '2024-12-15',
    helpful: 24,
    verified: true
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sara Ali',
    rating: 4,
    comment: 'Good product overall. The design is sleek and modern. Only giving 4 stars because delivery took a bit longer than expected.',
    date: '2024-12-10',
    helpful: 12,
    verified: true
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Zain Malik',
    rating: 5,
    comment: 'Perfect! Exactly what I was looking for. The build quality is amazing and it works flawlessly. Will definitely buy again.',
    date: '2024-12-05',
    helpful: 18,
    verified: false
  }
];

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productRating, reviewCount }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const ratingDistribution = [
    { stars: 5, percentage: 70 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 7 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 1 },
  ];

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }
    if (newRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (newComment.trim().length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      userId: user?.id || '',
      userName: user?.name || 'Anonymous',
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      verified: true
    };

    setReviews([newReview, ...reviews]);
    setNewRating(0);
    setNewComment('');
    setShowForm(false);
    toast.success('Review submitted successfully!');
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    ));
  };

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="text-center p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl border border-amber-500/20">
          <div className="text-6xl font-bold text-amber-500">{productRating}</div>
          <div className="flex justify-center gap-1 my-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${i < Math.floor(productRating) ? 'fill-amber-500 text-amber-500' : 'fill-muted text-muted'}`}
              />
            ))}
          </div>
          <p className="text-muted-foreground">Based on {reviewCount} reviews</p>
        </div>

        <div className="space-y-3">
          {ratingDistribution.map(({ stars, percentage }) => (
            <div key={stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{stars}</span>
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-12">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Customer Reviews</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Star className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="p-6 bg-card rounded-2xl border border-border/50 space-y-4 animate-fade-in">
          <h4 className="font-semibold">Share your experience</h4>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || newRating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'fill-muted text-muted'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Your Review</p>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="input-field min-h-[120px] resize-none"
            />
          </div>

          <button onClick={handleSubmitReview} className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            Submit Review
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.userName}</span>
                    {review.verified && (
                      <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-500 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'fill-muted text-muted'}`}
                  />
                ))}
              </div>
            </div>
            
            <p className="text-foreground/90 mb-4">{review.comment}</p>
            
            <button 
              onClick={() => handleHelpful(review.id)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              Helpful ({review.helpful})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;