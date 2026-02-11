"use client";
import React, { useState, useEffect } from "react";
import { getAllProviders, getUserReviews, getProviderReviews } from "@/lib/auth";
import { Provider, Review } from "@/config/api";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";

const ProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [providerReviews, setProviderReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);
  const { isOpen, openModal, closeModal } = useModal();

  function normalizeImageUrl(url: string): string {
    // Fix missing slash after port number
    return url.replace(/(\d)(data)/, '$1/$2');
  }

  const fetchProviders = async (page: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllProviders(page);
      setProviders(response.providers);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
      setCurrentPage(response.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch providers");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviderReviews = async (providerId: number) => {
    setIsLoadingReviews(true);
    try {
      const response = await getProviderReviews(providerId);
      setProviderReviews(response.reviews);
    } catch (err) {
      console.error("Failed to fetch provider reviews:", err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleViewProvider = async (provider: Provider) => {
    setSelectedProvider(provider);
    await fetchProviderReviews(provider.id);
    openModal();
  };

  const handleNextPage = () => {
    if (hasNext) {
      fetchProviders(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      fetchProviders(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter(provider =>
    provider.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.user.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to fix image URLs
  const fixImageUrl = (url: string | null): string => {
    if (!url) return '/images/placeholder-user.jpg';
    
    // Fix malformed localhost URLs
    if (url.includes('://localhost') && !url.match(/:\/\/localhost:\d+\//)) {
      return url.replace(/(:\/\/localhost:\d+)/, '$1/');
    }
    
    return url;
  };

  if (isLoading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Service Providers" />

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Search and Stats */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search providers by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {providers.length} providers
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Provider
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  KYC Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Opportunities
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredProviders.map((provider) => (
                <tr key={provider.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {provider.user.profileImg ? (
                          <Image
                            className="h-10 w-10 rounded-full"
                            src={normalizeImageUrl(provider.user.profileImg || '')}
                            alt={provider.providerName}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-500 text-white font-semibold">
                            {provider.providerName?.charAt(0) || 'P'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {provider.providerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {provider.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {provider.user.contact}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {provider.user.contactVerified ? (
                        <span className="inline-flex items-center text-green-600 dark:text-green-400">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Not verified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {provider.user.location}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Array.isArray(provider.workingAreas) 
                        ? provider.workingAreas.map(area => typeof area === 'string' ? area : area.name || area.title || String(area)).join(', ')
                        : String(provider.workingAreas || '')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${provider.user.kycStatus === 'VERIFIED' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : provider.user.kycStatus === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : provider.user.kycStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {provider.user.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                        {provider.rating.toFixed(1)}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${star <= provider.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
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
                      {provider.contracts}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewProvider(provider)}
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

      {/* Pagination */}
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

      {/* Provider Details Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl m-4">
        {selectedProvider && (
          <div className="no-scrollbar relative w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Provider Details
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
              {/* Provider Information */}
              <div className="md:col-span-1 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex-shrink-0">
                    {selectedProvider.user.profileImg ? (
                      <Image
                        className="h-24 w-24 rounded-full"
                        src={normalizeImageUrl(selectedProvider.user.profileImg || '')}
                        alt={selectedProvider.providerName}
                        width={96}
                        height={96}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-24 w-24 rounded-full bg-brand-500 text-white text-2xl font-semibold">
                        {selectedProvider.providerName?.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedProvider.providerName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedProvider.user.email}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedProvider.user.contact}
                      {selectedProvider.user.contactVerified && (
                        <span className="inline-flex items-center ml-2 text-green-600 dark:text-green-400">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-500 dark:text-gray-400">
                        Location:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedProvider.user.location}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Nationality:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedProvider.user.nationality}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Role:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedProvider.user.role}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        KYC Status:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedProvider.user.kycStatus}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Rating:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right flex items-center justify-end">
                        <span className="mr-1">{selectedProvider.rating.toFixed(1)}</span>
                        <svg
                          className="h-4 w-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Contracts:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {selectedProvider.contracts}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Joined:
                      </p>
                      <p className="text-gray-900 dark:text-white text-right">
                        {formatDate(selectedProvider.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Reviews */}
              <div className="md:col-span-2 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Provider Reviews
                </h4>
                {isLoadingReviews ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  </div>
                ) : providerReviews.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {providerReviews.map((review) => (
                      <div key={review.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {review.user.profileImg ? (
                                <Image
                                  className="h-10 w-10 rounded-full"
                                  src={normalizeImageUrl(review.user.profileImg || '')}
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
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(review.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white mr-1">
                              {review.rating.toFixed(1)}
                            </span>
                            <div className="flex">
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
                        </div>
                        <div className="mt-3 text-sm text-gray-900 dark:text-white">
                          {review.message}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No reviews available for this provider.
                  </div>
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProvider.user.languages.map((language: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProvidersPage;