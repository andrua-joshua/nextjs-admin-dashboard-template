"use client";
import React, { useState, useEffect } from "react";
import { getUserReviews, getProviderReviews } from "@/lib/auth";
import { Review, User, Provider } from "@/config/api";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import UserSearch from "@/components/common/UserSearch";
import ProviderSearch from "@/components/common/ProviderSearch";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";

interface ReviewWithUser extends Review {
  user: User;
}

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedReview, setSelectedReview] = useState<ReviewWithUser | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [reviewType, setReviewType] = useState<'user' | 'provider'>('user');

  const fetchReviews = async (userId: number, page: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserReviews(userId, page);
      setReviews(response.reviews);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
      setCurrentPage(response.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviderReviews = async (providerId: number, page: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProviderReviews(providerId, page);
      setReviews(response.reviews);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
      setCurrentPage(response.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch provider reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReview = (review: ReviewWithUser) => {
    setSelectedReview(review);
    openModal();
  };

  const handleUserSelect = (user: User | null) => {
    setSelectedUserId(user?.id || null);
    setSelectedProvider(null);
    setReviewType('user');
    if (user) {
      fetchReviews(user.id);
    } else {
      setReviews([]);
    }
  };

  const handleProviderSelect = (provider: Provider | null) => {
    setSelectedProvider(provider);
    setSelectedUserId(null);
    setReviewType('provider');
    if (provider) {
      fetchProviderReviews(provider.id);
    } else {
      setReviews([]);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      if (reviewType === 'user' && selectedUserId) {
        fetchReviews(selectedUserId, currentPage + 1);
      } else if (reviewType === 'provider' && selectedProvider) {
        fetchProviderReviews(selectedProvider.id, currentPage + 1);
      }
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      if (reviewType === 'user' && selectedUserId) {
        fetchReviews(selectedUserId, currentPage - 1);
      } else if (reviewType === 'provider' && selectedProvider) {
        fetchProviderReviews(selectedProvider.id, currentPage - 1);
      }
    }
  };

  const handleRefresh = () => {
    if (reviewType === 'user' && selectedUserId) {
      fetchReviews(selectedUserId);
    } else if (reviewType === 'provider' && selectedProvider) {
      fetchProviderReviews(selectedProvider.id);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch (error) {
      return dateString;
    }
  };
  
  // Fix image URLs if they're relative
  const fixImageUrl = (url: string | null) => {
    if (!url) return '';
    // If URL doesn't have a protocol, assume it's relative and add the base URL
    if (!url.startsWith('http')) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}${url}`;
    }
    return url;
  };

  const filteredReviews = reviews.filter(review =>
    review.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare the content based on loading state
  const renderContent = () => {
    // Show loading spinner if we've selected a user/provider and are waiting for results
    if (isLoading && (selectedUserId !== null || selectedProvider !== null) && reviews.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
        </div>
      );
    }
    
    // Main content
    return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="User Reviews" />

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Review Type Selection */}
      <div className="p-6 border-2 border-brand-500 rounded-2xl dark:border-brand-400 bg-brand-50 dark:bg-brand-900/20 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center">
          <svg className="w-5 h-5 mr-2 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Select Review Type and Search
        </h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Choose whether to view user reviews or provider reviews, then search for the specific user or provider.
        </p>
        
        <div className="space-y-4">
          {/* Review Type Toggle */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setReviewType('user');
                setSelectedUserId(null);
                setSelectedProvider(null);
                setReviews([]);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewType === 'user'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              User Reviews
            </button>
            <button
              type="button"
              onClick={() => {
                setReviewType('provider');
                setSelectedUserId(null);
                setSelectedProvider(null);
                setReviews([]);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewType === 'provider'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Provider Reviews
            </button>
          </div>

          {/* Search Components */}
          <div className="flex gap-4">
            {reviewType === 'user' ? (
              <div className="flex-1 max-w-md">
                <UserSearch
                  onSelect={handleUserSelect}
                  placeholder="Search users..."
                />
              </div>
            ) : (
              <div className="flex-1 max-w-md">
                <ProviderSearch
                  onSelect={handleProviderSelect}
                  placeholder="Search providers..."
                />
              </div>
            )}
            <Button onClick={handleRefresh} disabled={isLoading || (!selectedUserId && !selectedProvider)}>
              {isLoading ? "Fetching..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      {reviews.length > 0 && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search reviews by message or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total: {reviews.length} reviews
            </div>
          </div>
        </div>
      )}

      {/* Reviews Table */}
      {reviews.length > 0 ? (
        <div className="overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Message
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {review.user.profileImg ? (
                            <Image
                              className="h-10 w-10 rounded-full"
                              src={fixImageUrl(review.user.profileImg)}
                              alt={review.user.fullName}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-500 text-white font-semibold">
                              {review.user.fullName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.user.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {review.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {review.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.rating.toFixed(1)}
                        </span>
                        <div className="ml-2 flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(review.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewReview(review)}
                        className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (selectedUserId || selectedProvider) ? (
        <div className="p-6 text-center border border-gray-200 rounded-2xl dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400">No reviews found for this {reviewType}.</p>
        </div>
      ) : (
        <div className="p-6 text-center border border-gray-200 rounded-2xl dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400">Please select a {reviewType} above to view their reviews.</p>
          <p className="mt-2 text-sm text-brand-500">The reviews page will remain empty until you select a {reviewType}.</p>
        </div>
      )}

      {/* Pagination */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage + 1}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreviousPage}
              disabled={!hasPrevious || isLoading}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextPage}
              disabled={!hasNext || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl m-4">
        {selectedReview && (
          <div className="no-scrollbar relative w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Review Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Information */}
              <div className="md:col-span-1 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  User Information
                </h4>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex-shrink-0">
                    {selectedReview.user.profileImg ? (
                      <Image
                        className="h-24 w-24 rounded-full"
                        src={fixImageUrl(selectedReview.user.profileImg)}
                        alt={selectedReview.user.fullName}
                        width={96}
                        height={96}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-24 w-24 rounded-full bg-brand-500 text-white text-2xl font-semibold">
                        {selectedReview.user.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedReview.user.fullName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReview.user.email}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReview.user.contact}
                    </div>
                  </div>
                  <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-500 dark:text-gray-400">
                        Location:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedReview.user.location}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Nationality:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedReview.user.nationality}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Role:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedReview.user.role}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        KYC Status:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedReview.user.kycStatus}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Rating:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedReview.user.rating.toFixed(1)}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Provider:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedReview.user.isProvider ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Details */}
              <div className="md:col-span-2 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Review Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rating
                    </label>
                    <div className="mt-1 flex items-center">
                      <span className="text-xl font-medium text-gray-900 dark:text-white mr-2">
                        {selectedReview.rating.toFixed(1)}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-6 w-6 ${star <= selectedReview.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </label>
                    <div className="mt-1 text-gray-900 dark:text-white">
                      {formatDate(selectedReview.createdAt)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {selectedReview.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

  // Final return statement that calls the renderContent function
  return renderContent();
};

export default ReviewsPage;