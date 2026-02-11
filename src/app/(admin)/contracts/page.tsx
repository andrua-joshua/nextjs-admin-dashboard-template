"use client";
import React, { useState, useEffect } from "react";
import { 
  getAllOffers, 
  getOffersByProvider, 
  getOffersByOpportunity,
  getOffersByProviderAndStatus,
  getProviderActiveAndInProgressOffers
} from "@/lib/auth";
import { Contract, Provider } from "@/config/api";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import ProviderSearch from "@/components/common/ProviderSearch";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [opportunityId, setOpportunityId] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const { isOpen, openModal, closeModal } = useModal();

  const fetchContracts = async (page: number = 0) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getAllOffers();
      setContracts(response.contracts);
      setCurrentPage(0);
      setHasNext(false);
      setHasPrevious(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch contracts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchContracts();
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      // For now, we'll filter client-side since there's no search endpoint
      const response = await getAllOffers();
      const filtered = response.contracts.filter(contract => 
        contract.opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.opportunity.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.provider.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.opportunity.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setContracts(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search contracts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByStatus = async () => {
    if (!statusFilter) {
      fetchContracts();
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await getAllOffers();
      const filtered = response.contracts.filter(contract => 
        contract.contractStatus === statusFilter
      );
      setContracts(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter contracts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByProvider = async () => {
    if (!selectedProvider) {
      fetchContracts();
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await getOffersByProvider(selectedProvider.id, 0, 10);
      setContracts(response.contracts);
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

  const handleFilterByOpportunity = async () => {
    if (!opportunityId) {
      fetchContracts();
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await getOffersByOpportunity(parseInt(opportunityId), 0, 10);
      setContracts(response.contracts);
      setCurrentPage(response.currentPage);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter by opportunity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
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

  useEffect(() => {
    fetchContracts();
  }, []);

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
        <PageBreadCrumb pageTitle="Contracts" />
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Contracts" />

      {/* Filters */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Filters
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search contracts..."
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
                <option value="">All Statuses</option>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Opportunity ID
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Opportunity ID"
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleFilterByOpportunity}>
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
              setStatusFilter("");
              setSelectedProvider(null);
              setOpportunityId("");
              fetchContracts();
            }}
          >
            Clear All Filters
          </Button>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Contracts ({contracts.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Contract ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Opportunity
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Provider
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Client
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Budget
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
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
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{contract.id}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {contract.opportunity.title || 'Untitled'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {contract.opportunity.service}
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

                          const profileImg = contract.provider.user.profileImg ?? undefined;
                          const hasError = imageErrorMap[String(contract.provider.user.id)];
                          
                          if (profileImg && isValidImageUrl(profileImg) && !hasError) {
                            return (
                              <Image
                                className="h-8 w-8 rounded-full"
                                src={profileImg}
                                alt={contract.provider.providerName || 'Provider'}
                                width={32}
                                height={32}
                                onError={() => {
                                  setImageErrorMap(prev => ({ ...prev, [String(contract.provider.user.id)]: true }));
                                }}
                              />
                            );
                          } else {
                            return (
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-500 text-white font-semibold text-sm">
                                {contract.provider.providerName?.charAt(0)?.toUpperCase() || 'P'}
                              </div>
                            );
                          }
                        })()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {contract.provider.providerName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Rating: {contract.provider.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {contract.opportunity.user.fullName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {contract.opportunity.user.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(contract.opportunity.budget)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.contractStatus)}`}>
                      {contract.contractStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(contract.createdAt)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(contract)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contracts.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              No contracts found
            </div>
          </div>
        )}
      </div>

      {/* Contract Details Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-4xl p-6"
      >
        {selectedContract && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-800 text-xl dark:text-white/90">
              Contract Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700 dark:text-gray-300">Contract Information</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract ID:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">#{selectedContract.id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedContract.contractStatus)}`}>
                      {selectedContract.contractStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{formatDate(selectedContract.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-gray-700 dark:text-gray-300">Opportunity Details</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.opportunity.title || 'Untitled'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Service:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.opportunity.service}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{formatCurrency(selectedContract.opportunity.budget)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.opportunity.location}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{formatDate(selectedContract.opportunity.deadline)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-medium text-gray-700 dark:text-gray-300">Description</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {selectedContract.opportunity.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700 dark:text-gray-300">Client Information</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.opportunity.user.fullName}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.opportunity.user.email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.opportunity.user.contact}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.opportunity.user.location}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-gray-700 dark:text-gray-300">Provider Information</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.provider.providerName}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.provider.user.email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedContract.provider.rating.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Services:</span>
                    <div className="ml-2 flex flex-wrap gap-1">
                      {selectedContract.provider.services && Array.isArray(selectedContract.provider.services) ? (
                        selectedContract.provider.services.map((service) => (
                          <span key={service.id} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                            {typeof service === 'string' ? service : service.title || service.name || String(service)}
                          </span>
                        ))
                      ) : null}
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
