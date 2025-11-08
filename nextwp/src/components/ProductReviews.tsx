"use client";

import { useState, useEffect } from "react";
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Filter, 
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Flag,
  Check,
  X,
  User,
  Calendar,
  Heart,
  Share2,
  Reply,
  Edit3,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userVerified: boolean;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  wouldRecommend: {
    yes: number;
    no: number;
    percentage: number;
  };
  recentReviews: Review[];
  topReviews: Review[];
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  productImage?: string;
  canReview?: boolean;
  onReviewSubmit?: (review: Omit<Review, 'id' | 'userId' | 'userName' | 'userAvatar' | 'userVerified' | 'createdAt' | 'updatedAt' | 'helpful' | 'notHelpful' | 'verified'>) => void;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    productId: "prod-1",
    userId: "user-1",
    userName: "John Doe",
    userAvatar: "/images/avatars/john.jpg",
    userVerified: true,
    rating: 5,
    title: "Excellent Product!",
    content: "This product exceeded my expectations. The quality is outstanding and the customer service was very helpful. Highly recommend!",
    helpful: 23,
    notHelpful: 1,
    verified: true,
    createdAt: "2025-01-20T10:30:00Z",
    updatedAt: "2025-01-20T10:30:00Z",
    images: ["/images/reviews/review1-1.jpg", "/images/reviews/review1-2.jpg"],
    pros: ["High quality", "Great value", "Fast shipping"],
    cons: ["Could be cheaper"],
    wouldRecommend: true,
  },
  {
    id: "2",
    productId: "prod-1",
    userId: "user-2",
    userName: "Jane Smith",
    userAvatar: "/images/avatars/jane.jpg",
    userVerified: true,
    rating: 4,
    title: "Good Product",
    content: "Solid product overall. Works as described and arrived on time. Minor issues with packaging but nothing major.",
    helpful: 15,
    notHelpful: 3,
    verified: true,
    createdAt: "2025-01-18T14:20:00Z",
    updatedAt: "2025-01-18T14:20:00Z",
    images: [],
    pros: ["Good quality", "Reasonable price"],
    cons: ["Packaging could be better"],
    wouldRecommend: true,
  },
  {
    id: "3",
    productId: "prod-1",
    userId: "user-3",
    userName: "Mike Johnson",
    userVerified: false,
    rating: 3,
    title: "Average Experience",
    content: "Product is okay but has some issues. The build quality could be better for the price point.",
    helpful: 8,
    notHelpful: 5,
    verified: false,
    createdAt: "2025-01-15T09:15:00Z",
    updatedAt: "2025-01-15T09:15:00Z",
    images: [],
    pros: ["Functional"],
    cons: ["Build quality", "Price"],
    wouldRecommend: false,
  },
  {
    id: "4",
    productId: "prod-1",
    userId: "user-4",
    userName: "Sarah Wilson",
    userVerified: true,
    rating: 5,
    title: "Absolutely Love It!",
    content: "This is my second purchase from this brand and I'm consistently impressed. The product quality is amazing and it works perfectly.",
    helpful: 31,
    notHelpful: 2,
    verified: true,
    createdAt: "2025-01-12T16:45:00Z",
    updatedAt: "2025-01-12T16:45:00Z",
    images: ["/images/reviews/review4-1.jpg"],
    pros: ["High quality", "Durable", "Easy to use"],
    cons: ["None"],
    wouldRecommend: true,
  },
  {
    id: "5",
    productId: "prod-1",
    userId: "user-5",
    userName: "David Brown",
    userVerified: false,
    rating: 2,
    title: "Disappointing",
    content: "Product didn't meet my expectations. The quality is poor and it stopped working after a week of use.",
    helpful: 3,
    notHelpful: 12,
    verified: false,
    createdAt: "2025-01-10T11:30:00Z",
    updatedAt: "2025-01-10T11:30:00Z",
    images: [],
    pros: ["Looks good"],
    cons: ["Poor quality", "Not durable", "Stopped working"],
    wouldRecommend: false,
  },
];

export default function ProductReviews({ 
  productId, 
  productName, 
  productImage,
  canReview = false,
  onReviewSubmit 
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS.filter(r => r.productId === productId));
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [sortBy, setSortBy] = useState("most_recent");
  const [filterRating, setFilterRating] = useState("all");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [replyForm, setReplyForm] = useState<{ reviewId: string; content: string }>({ reviewId: "", content: "" });
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [newReview, setNewReview] = useState<{
    rating: number;
    title: string;
    content: string;
    wouldRecommend: boolean;
    pros: string[];
    cons: string[];
  }>({
    rating: 0,
    title: "",
    content: "",
    wouldRecommend: true,
    pros: [],
    cons: [],
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const reviewStats: ReviewStats = {
      averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0,
      totalReviews: reviews.length,
      ratingDistribution: [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length,
        percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100,
      })),
      wouldRecommend: {
        yes: reviews.filter(r => r.wouldRecommend).length,
        no: reviews.filter(r => !r.wouldRecommend).length,
        percentage: (reviews.filter(r => r.wouldRecommend).length / reviews.length) * 100,
      },
      recentReviews: reviews
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
      topReviews: reviews
        .sort((a, b) => (b.helpful - b.notHelpful) - (a.helpful - a.notHelpful))
        .slice(0, 5),
    };

    setStats(reviewStats);
  }, [reviews]);

  useEffect(() => {
    let filteredReviews = [...reviews];

    if (filterRating !== "all") {
      filteredReviews = filteredReviews.filter(r => r.rating === parseInt(filterRating));
    }

    switch (sortBy) {
      case "most_recent":
        filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "most_helpful":
        filteredReviews.sort((a, b) => (b.helpful - b.notHelpful) - (a.helpful - a.notHelpful));
        break;
      case "highest_rating":
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest_rating":
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    setReviews(filteredReviews);
  }, [sortBy, filterRating]);

  const handleSubmitReview = () => {
    if (!newReview.rating || !newReview.title.trim() || !newReview.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const review: Review = {
      id: `review-${Date.now()}`,
      productId,
      userId: "current-user",
      userName: "Current User",
      userVerified: true,
      rating: newReview.rating,
      title: newReview.title,
      content: newReview.content,
      helpful: 0,
      notHelpful: 0,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pros: newReview.pros,
      cons: newReview.cons,
      wouldRecommend: newReview.wouldRecommend,
    };

    if (onReviewSubmit) {
      onReviewSubmit(review);
    }

    setReviews([review, ...reviews]);
    setShowReviewForm(false);
    setNewReview({ rating: 0, title: "", content: "", wouldRecommend: true, pros: [], cons: [] });
    
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });
  };

  const handleHelpful = (reviewId: string, helpful: boolean) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          helpful: helpful ? review.helpful + 1 : review.helpful,
          notHelpful: !helpful ? review.notHelpful + 1 : review.notHelpful,
        };
      }
      return review;
    }));

    toast({
      title: "Thank you for your feedback",
      description: "Your response helps others make better decisions.",
    });
  };

  const handleReply = (reviewId: string) => {
    // Mock reply functionality
    toast({
      title: "Reply Submitted",
      description: "Your reply has been posted successfully.",
    });
    setShowReplyForm(false);
    setReplyForm({ reviewId: "", content: "" });
  };

  const handleReport = (reviewId: string) => {
    // Mock report functionality
    toast({
      title: "Review Reported",
      description: "Thank you for helping us maintain quality reviews.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const starSize = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    }[size];

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderReview = (review: Review) => {
    return (
      <Card key={review.id} className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                {review.userAvatar ? (
                  <AvatarImage src={review.userAvatar} alt={review.userName} />
                ) : (
                  <AvatarFallback>
                    {review.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{review.userName}</h4>
                  {review.userVerified && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleReport(review.id)}
                  className="text-red-600"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">{review.title}</h3>
            <div className="flex items-center gap-4 mb-3">
              {renderStars(review.rating)}
              {review.verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified Purchase
                </Badge>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>
            
            {review.pros && review.pros.length > 0 && review.cons && review.cons.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {review.pros.length > 0 && (
                  <div>
                    <h5 className="font-medium text-green-600 mb-2">Pros</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.cons.length > 0 && (
                  <div>
                    <h5 className="font-medium text-red-600 mb-2">Cons</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {review.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {review.images && review.images.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHelpful(review.id, true)}
                  className="text-green-600 hover:text-green-700"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Helpful ({review.helpful})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHelpful(review.id, false)}
                  className="text-red-600 hover:text-red-700"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Not Helpful ({review.notHelpful})
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReplyForm(true)}
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-500">Average Rating</h3>
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats?.averageRating.toFixed(1) || "0.0"}</span>
              <span className="text-lg text-gray-500">/5</span>
            </div>
            <p className="text-sm text-gray-500">{stats?.totalReviews || 0} reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-500">Would Recommend</h3>
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats?.wouldRecommend.yes || 0}</span>
              <span className="text-lg text-gray-500">/</span>
              <span className="text-3xl font-bold">{stats?.totalReviews || 0}</span>
            </div>
            <p className="text-sm text-gray-500">{stats?.wouldRecommend.percentage.toFixed(0)}% would recommend</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-500">Verified Reviews</h3>
              <Check className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{reviews.filter(r => r.verified).length}</span>
              <span className="text-lg text-gray-500">/</span>
              <span className="text-3xl font-bold">{reviews.length}</span>
            </div>
            <p className="text-sm text-gray-500">Verified purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-500">With Photos</h3>
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{reviews.filter(r => r.images && r.images.length > 0).length}</span>
              <span className="text-lg text-gray-500">/</span>
              <span className="text-3xl font-bold">{reviews.length}</span>
            </div>
            <p className="text-sm text-gray-500">Reviews with images</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>How customers rated this product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-24">
                  <span className="text-sm font-medium w-3">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-500 w-16 text-right">{count} ({percentage.toFixed(0)}%)</span>
              </div>
            </div>
          ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {canReview && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
            <CardDescription>Share your experience with this product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label>Overall Rating</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-colors"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(newReview.rating)}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredStar || newReview.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Review Title</Label>
                <Input
                  id="title"
                  placeholder="Summarize your experience"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="content">Review</Label>
                <Textarea
                  id="content"
                  placeholder="Tell us about your experience with this product..."
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label>Would you recommend this product?</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={newReview.wouldRecommend ? "default" : "outline"}
                    onClick={() => setNewReview({ ...newReview, wouldRecommend: true })}
                    className="flex-1"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Yes
                  </Button>
                  <Button
                    variant={!newReview.wouldRecommend ? "default" : "outline"}
                    onClick={() => setNewReview({ ...newReview, wouldRecommend: false })}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    No
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pros (Optional)</Label>
                  <Input
                    placeholder="What did you like about this product?"
                    value={newReview.pros.join(", ")}
                    onChange={(e) => setNewReview({ ...newReview, pros: e.target.value.split(", ").filter(p => p.trim()) })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Cons (Optional)</Label>
                  <Input
                    placeholder="What could be improved?"
                    value={newReview.cons.join(", ")}
                    onChange={(e) => setNewReview({ ...newReview, cons: e.target.value.split(", ").filter(c => c.trim()) })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitReview}>
                  Submit Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>See what others are saying about this product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4 flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most_recent">Most Recent</SelectItem>
                  <SelectItem value="most_helpful">Most Helpful</SelectItem>
                  <SelectItem value="highest_rating">Highest Rating</SelectItem>
                  <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map(review => renderReview(review))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">
                Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={showReplyForm} onOpenChange={setShowReplyForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Respond to customer feedback
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply-content">Your Reply</Label>
              <Textarea
                id="reply-content"
                placeholder="Write your response..."
                value={replyForm.content}
                onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowReplyForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleReply(replyForm.reviewId)}>
                Post Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
