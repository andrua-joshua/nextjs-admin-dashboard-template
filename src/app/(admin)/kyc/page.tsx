"use client";
import React, { useState, useEffect } from "react";
import { getAllKyc, updateKycStatus } from "@/lib/auth";
import { KYC, UpdateKycStatusRequest, User } from "@/config/api";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import UserSearch from "@/components/common/UserSearch";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";

export default function KycPage() {
  const [kycRecords, setKycRecords] = useState<KYC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedKyc, setSelectedKyc] = useState<KYC | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");
  const { isOpen, openModal, closeModal } = useModal();

  // Function to fix image URLs if they're relative
  const fixImageUrl = (url: string | null) => {
    if (!url) return '';
    // If URL doesn't have a protocol, assume it's relative and add the base URL
    if (!url.startsWith('http')) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}${url}`;
    }
    return url;
  };

  const fetchKycRecords = async (page: number = 0) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getAllKyc(page, 10);
      setKycRecords(response.kyc);
      setCurrentPage(response.currentPage);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch KYC records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKycRecords();
  }, []);

  const handleViewKyc = (kyc: KYC) => {
    setSelectedKyc(kyc);
    openModal();
  };

  const handleNextPage = () => {
    if (hasNext) {
      fetchKycRecords(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      fetchKycRecords(currentPage - 1);
    }
  };

  const handleUpdateStatus = async (userId: number, status: string) => {
    try {
      setStatusUpdateLoading(true);
      setError("");
      setUpdateSuccess("");
      
      const statusData: UpdateKycStatusRequest = { status };
      await updateKycStatus(userId, statusData);
      
      // Update the local state to reflect the change
      setKycRecords(prevRecords => 
        prevRecords.map(record => 
          record.user.id === userId 
            ? { ...record, status } 
            : record
        )
      );
      
      // If we're updating the currently selected KYC record, update that too
      if (selectedKyc && selectedKyc.user.id === userId) {
        setSelectedKyc({ ...selectedKyc, status });
      }
      
      setUpdateSuccess(`KYC status updated to ${status} successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update KYC status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const filteredKycRecords = kycRecords.filter(kyc => {
    // If a specific user is selected, filter by that user
    if (selectedUser) {
      return kyc.user.id === selectedUser.id;
    }
    
    // Otherwise, use the general search term
    return kyc.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           kyc.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           kyc.status.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUserSelect = (user: User | null) => {
    setSelectedUser(user);
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'INPROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'PENDING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading && kycRecords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="KYC Management" />

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Success Message */}
      {updateSuccess && (
        <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          {updateSuccess}
        </div>
      )}

      {/* Search and Stats */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by name, email, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 max-w-md">
            <UserSearch
              onSelect={handleUserSelect}
              placeholder="Search specific user..."
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {kycRecords.length} KYC records
          </div>
          <Button onClick={() => fetchKycRecords(currentPage)} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* KYC Records Table */}
      <div className="overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
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
              {filteredKycRecords.length > 0 ? (
                filteredKycRecords.map((kyc) => (
                  <tr key={kyc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {kyc.user.profileImg ? (
                            <Image
                              src={fixImageUrl(kyc.user.profileImg)}
                              alt={kyc.user.fullName}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                {kyc.user.fullName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {kyc.user.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {kyc.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getKycStatusColor(kyc.status)}`}>
                        {kyc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(kyc.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewKyc(kyc)}
                        className="mr-2"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {isLoading ? "Loading..." : "No KYC records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousPage}
          disabled={!hasPrevious || isLoading}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage + 1}
        </span>
        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={!hasNext || isLoading}
        >
          Next
        </Button>
      </div>

      {/* KYC Details Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl mx-auto">
        {selectedKyc && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                KYC Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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

            {/* User Information */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                User Information
              </h4>
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-16 w-16">
                  {selectedKyc.user.profileImg ? (
                    <Image
                      src={fixImageUrl(selectedKyc.user.profileImg)}
                      alt={selectedKyc.user.fullName}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xl font-medium">
                        {selectedKyc.user.fullName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedKyc.user.fullName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedKyc.user.email}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedKyc.user.contact}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedKyc.user.location}, {selectedKyc.user.nationality}
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Status */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                KYC Status
              </h4>
              <div className="flex items-center mb-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getKycStatusColor(selectedKyc.status)}`}>
                  {selectedKyc.status}
                </span>
                <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  Submitted on {formatDate(selectedKyc.createdAt)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus(selectedKyc.user.id, "VERIFIED")}
                  disabled={statusUpdateLoading || selectedKyc.status === "VERIFIED"}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Verify
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus(selectedKyc.user.id, "FAILED")}
                  disabled={statusUpdateLoading || selectedKyc.status === "FAILED"}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus(selectedKyc.user.id, "INPROGRESS")}
                  disabled={statusUpdateLoading || selectedKyc.status === "INPROGRESS"}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Mark In Progress
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus(selectedKyc.user.id, "PENDING")}
                  disabled={statusUpdateLoading || selectedKyc.status === "PENDING"}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Mark Pending
                </Button>
              </div>
            </div>

            {/* ID and Selfie Images */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Verification Documents
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    National ID
                  </h5>
                  <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={fixImageUrl(selectedKyc.nationalIdUrl)}
                      alt="National ID"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <a 
                    href={fixImageUrl(selectedKyc.nationalIdUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    View Full Size
                  </a>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selfie
                  </h5>
                  <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={fixImageUrl(selectedKyc.selfieUrl)}
                      alt="Selfie"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <a 
                    href={fixImageUrl(selectedKyc.selfieUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    View Full Size
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}