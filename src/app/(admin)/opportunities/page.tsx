"use client";
import React, { useState, useEffect } from "react";
import { 
  getAllOpportunities, 
  filterOpportunities, 
  getOpportunitiesByService,
  getOpportunitiesByLocation,
  searchOpportunities 
} from "@/lib/auth";
import { Opportunity, User } from "@/config/api";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import UserSearch from "@/components/common/UserSearch";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  function normalizeImageUrl(url: string): string {
    // Fix missing slash after port number
    return url.replace(/(\d)(data)/, '$1/$2');
  }
  const fetchOpportunities = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getAllOpportunities();
      const opportunities = response.opportunities || [];
      // Defensive: ensure opportunities is an array
      if (!Array.isArray(opportunities)) {
        console.error('Opportunities response is not an array:', response);
        setOpportunities([]);
      } else {
        setOpportunities(opportunities);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch opportunities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchOpportunities();
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await searchOpportunities(searchTerm);
      setOpportunities(response.opportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search opportunities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByService = async () => {
    if (!serviceFilter.trim()) {
      fetchOpportunities();
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await getOpportunitiesByService(serviceFilter);
      setOpportunities(response.opportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter by service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByLocation = async () => {
    if (!locationFilter.trim()) {
      fetchOpportunities();
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await getOpportunitiesByLocation(locationFilter);
      setOpportunities(response.opportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter by location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancedFilter = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await filterOpportunities(
        searchTerm || undefined,
        minBudget ? parseFloat(minBudget) : undefined,
        maxBudget ? parseFloat(maxBudget) : undefined
      );
      setOpportunities(response.opportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter opportunities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    openModal();
  };

  const handleUserSelect = (user: User | null) => {
    setSelectedUser(user);
  };

  // Filter opportunities based on selected user
  const filteredOpportunities = selectedUser 
    ? opportunities.filter(opportunity => opportunity.user.id === selectedUser.id)
    : opportunities;

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
    });
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  if (isLoading && opportunities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Opportunities Management" />

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Filters & Search
        </h3>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button size="sm" onClick={handleSearch} disabled={isLoading}>
                Search
              </Button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Service
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Filter by service..."
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              />
              <Button size="sm" onClick={handleFilterByService} disabled={isLoading}>
                Filter
              </Button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <Button size="sm" onClick={handleFilterByLocation} disabled={isLoading}>
                Filter
              </Button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget Range
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
              />
              <Button size="sm" onClick={handleAdvancedFilter} disabled={isLoading}>
                Filter
              </Button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Client
            </label>
            <UserSearch
              onSelect={handleUserSelect}
              placeholder="Search by client..."
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button size="sm" variant="outline" onClick={() => {
            setSearchTerm("");
            setServiceFilter("");
            setLocationFilter("");
            setMinBudget("");
            setMaxBudget("");
            setSelectedUser(null);
            fetchOpportunities();
          }} disabled={isLoading}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredOpportunities.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedUser ? 'Filtered Opportunities' : 'Total Opportunities'}
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {opportunities.filter(opp => opp.isActive).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Active Opportunities
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.budget, 0))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Budget Value
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Opportunity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Budget
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Deadline
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredOpportunities.map((opportunity) => (
                <tr key={opportunity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {opportunity.title || 'Untitled Opportunity'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {opportunity.description.substring(0, 100)}...
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {opportunity.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {opportunity.user.profileImg ? (
                          <Image
                            className="h-8 w-8 rounded-full"
                            src={normalizeImageUrl(opportunity.user.profileImg || '')}
                            alt={opportunity.user.fullName}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-500 text-white font-semibold text-sm">
                            {opportunity.user.fullName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {opportunity.user.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {opportunity.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {opportunity.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(opportunity.budget)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(opportunity.deadline)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      opportunity.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {opportunity.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewOpportunity(opportunity)}
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

      {/* Opportunity Details Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl m-4">
        <div className="no-scrollbar relative w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Opportunity Details
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedOpportunity && (
            <div className="space-y-6">
              {/* Opportunity Header */}
              <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedOpportunity.title || 'Untitled Opportunity'}
                </h4>
                <div className="flex items-center gap-4">
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {selectedOpportunity.service}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedOpportunity.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {selectedOpportunity.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Client Information */}
              <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Client Information
                </h5>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {selectedOpportunity.user.profileImg ? (
                      <Image
                        className="h-12 w-12 rounded-full"
                        src={selectedOpportunity.user.profileImg}
                        alt={selectedOpportunity.user.fullName}
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-500 text-white font-semibold">
                        {selectedOpportunity.user.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedOpportunity.user.fullName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedOpportunity.user.email}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedOpportunity.user.contact}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opportunity Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedOpportunity.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedOpportunity.location}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Budget
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedOpportunity.budget)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Deadline
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedOpportunity.deadline)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created At
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedOpportunity.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Contact Information
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedOpportunity.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      WhatsApp
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedOpportunity.whatsAppContact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
