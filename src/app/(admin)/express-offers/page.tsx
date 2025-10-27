"use client";
import React, { useState, useEffect } from "react";
import { 
  getOffersByUserAndStatus,
  getOffersByProviderAndStatusExpress
} from "@/lib/auth";
import { ExpressOffer, Provider } from "@/config/api";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import ProviderSearch from "@/components/common/ProviderSearch";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";

export default function ExpressOffersPage() {
  const [expressOffers, setExpressOffers] = useState<ExpressOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<ExpressOffer | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const { isOpen, openModal, closeModal } = useModal();

  const fetchExpressOffers = async (page: number = 0) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getOffersByUserAndStatus(statusFilter, page, 10);
      setExpressOffers(response.offers);
      setCurrentPage(response.currentPage);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch express offers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchExpressOffers();
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await getOffersByUserAndStatus(statusFilter, 0, 100);
      const filtered = response.offers.filter(offer => 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.provider.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setExpressOffers(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search express offers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByStatus = async () => {
    if (!statusFilter) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await getOffersByUserAndStatus(statusFilter, 0, 10);
      setExpressOffers(response.offers);
      setCurrentPage(response.currentPage);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter express offers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByProvider = async () => {
    if (!selectedProvider) {
      fetchExpressOffers();
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await getOffersByProviderAndStatusExpress(selectedProvider.id, statusFilter, 0, 10);
      setExpressOffers(response.offers);
      setCurrentPage(response.currentPage);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter by provider");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (provider: Provider | null) => {
    setSelectedProvider(provider);
  };

  const handleViewDetails = (offer: ExpressOffer) => {
    setSelectedOffer(offer);
    openModal();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'INPROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAcceptanceStatus = (isAccepted: boolean, confirmed: boolean) => {
    if (confirmed) return 'Confirmed';
    if (isAccepted) return 'Accepted';
    return 'Pending';
  };

  const getAcceptanceColor = (isAccepted: boolean, confirmed: boolean) => {
    if (confirmed) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (isAccepted) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  };

  useEffect(() => {
    fetchExpressOffers();
  }, [statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Express Offers" />
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Express Offers" />

      {/* Filters */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Filters
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search express offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="INPROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Button size="sm" onClick={handleFilterByStatus}>
                Filter
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            <div className="flex gap-2">
              <ProviderSearch
                onSelect={handleProviderSelect}
                placeholder="Search providers..."
                className="flex-1"
              />
              <Button size="sm" onClick={handleFilterByProvider}>
                Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("PENDING");
              setSelectedProvider(null);
              fetchExpressOffers();
            }}
          >
            Clear All Filters
          </Button>
        </div>
      </div>

      {/* Express Offers Table */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Express Offers ({expressOffers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Offer ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Client
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Provider
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Budget
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Acceptance
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expressOffers.map((offer) => (
                <tr key={offer.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{offer.id}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {offer.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {offer.description}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        {(() => {
                          const isValidImageUrl = (url: string) => {
                            try {
                              new URL(url);
                              return true;
                            } catch (e) {
                              return false;
                            }
                          };

                          const profileImg = offer.user.profileImg ?? undefined;
                          const hasError = imageErrorMap[String(offer.user.id)];
                          
                          if (profileImg && isValidImageUrl(profileImg) && !hasError) {
                            return (
                              <Image
                                className="h-8 w-8 rounded-full"
                                src={profileImg}
                                alt={offer.user.fullName || 'User'}
                                width={32}
                                height={32}
                                onError={() => {
                                  setImageErrorMap(prev => ({ ...prev, [String(offer.user.id)]: true }));
                                }}
                              />
                            );
                          } else {
                            return (
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-500 text-white font-semibold text-sm">
                                {offer.user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            );
                          }
                        })()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {offer.user.fullName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {offer.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        {(() => {
                          const isValidImageUrl = (url: string) => {
                            try {
                              new URL(url);
                              return true;
                            } catch (e) {
                              return false;
                            }
                          };

                          const profileImg = offer.provider.user.profileImg ?? undefined;
                          const hasError = imageErrorMap[String(offer.provider.user.id)];
                          
                          if (profileImg && isValidImageUrl(profileImg) && !hasError) {
                            return (
                              <Image
                                className="h-8 w-8 rounded-full"
                                src={profileImg}
                                alt={offer.provider.providerName || 'Provider'}
                                width={32}
                                height={32}
                                onError={() => {
                                  setImageErrorMap(prev => ({ ...prev, [String(offer.provider.user.id)]: true }));
                                }}
                              />
                            );
                          } else {
                            return (
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white font-semibold text-sm">
                                {offer.provider.providerName?.charAt(0)?.toUpperCase() || 'P'}
                              </div>
                            );
                          }
                        })()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {offer.provider.providerName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Rating: {offer.provider.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(offer.budget)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(offer.status)}`}>
                      {offer.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAcceptanceColor(offer.isAcceptedByProvider, offer.confirmedByProvider)}`}>
                      {getAcceptanceStatus(offer.isAcceptedByProvider, offer.confirmedByProvider)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(offer.createdAt)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(offer)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expressOffers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              No express offers found
            </div>
          </div>
        )}

        {/* Pagination */}
        {(hasNext || hasPrevious) && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage + 1}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchExpressOffers(currentPage - 1)}
                disabled={!hasPrevious}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchExpressOffers(currentPage + 1)}
                disabled={!hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Express Offer Details Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-4xl p-6"
      >
        {selectedOffer && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-800 text-xl dark:text-white/90">
              Express Offer Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700 dark:text-gray-300">Offer Information</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Offer ID:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">#{selectedOffer.id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedOffer.title}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{formatCurrency(selectedOffer.budget)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOffer.status)}`}>
                      {selectedOffer.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Acceptance:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAcceptanceColor(selectedOffer.isAcceptedByProvider, selectedOffer.confirmedByProvider)}`}>
                      {getAcceptanceStatus(selectedOffer.isAcceptedByProvider, selectedOffer.confirmedByProvider)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{formatDate(selectedOffer.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-gray-700 dark:text-gray-300">Description</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {selectedOffer.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700 dark:text-gray-300">Client Information</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedOffer.user.fullName}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedOffer.user.email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedOffer.user.contact}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedOffer.user.location}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">KYC Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedOffer.user.kycStatus === 'VERIFIED' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : selectedOffer.user.kycStatus === 'INPROGRESS'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {selectedOffer.user.kycStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-gray-700 dark:text-gray-300">Provider Information</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedOffer.provider.providerName}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedOffer.provider.user.email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedOffer.provider.rating.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedOffer.provider.description}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Services:</span>
                    <div className="ml-2 flex flex-wrap gap-1">
                      {selectedOffer.provider.services.map((service) => (
                        <span key={service.id} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                          {service.title}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Working Areas:</span>
                    <div className="ml-2 flex flex-wrap gap-1">
                      {selectedOffer.provider.workingAreas.map((area, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-400">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end w-full gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
