"use client";
import React, { useState, useEffect } from "react";
import { getAllUsers, getProfileById } from "@/lib/auth";
import { User } from "@/config/api";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Function to fix malformed image URLs
  const fixImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (!url.startsWith('http')) return null;
    
    // Fix common localhost URL issues (missing slash after port)
    if (url.includes('://localhost')) {
      const localhostPortMatch = url.match(/:\/\/localhost:(\d+)([^\/])/i);
      if (localhostPortMatch) {
        return url.replace(
          `://localhost:${localhostPortMatch[1]}${localhostPortMatch[2]}`,
          `://localhost:${localhostPortMatch[1]}/${localhostPortMatch[2]}`
        );
      }
    }
    
    return url;
  };
  const { isOpen, openModal, closeModal } = useModal();

  const fetchUsers = async (page: number = 0) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getAllUsers(page, 10);
      setUsers(response.users);
      setCurrentPage(response.currentPage);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewUser = async (userId: number) => {
    try {
      const response = await getProfileById(userId);
      setSelectedUser(response.user);
      openModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user details");
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      fetchUsers(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      fetchUsers(currentPage - 1);
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Users Management" />

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
            placeholder="Search users by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  User
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
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {fixImageUrl(user.profileImg) ? (
                          <Image
                            className="h-10 w-10 rounded-full"
                            src={fixImageUrl(user.profileImg)!}
                            alt={user.fullName}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-500 text-white font-semibold">
                            {user.fullName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.contact}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.contactVerified ? 'Verified' : 'Unverified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.location}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.nationality}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKycStatusColor(user.kycStatus)}`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user.role}
                      </span>
                      {user.isProvider && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          Provider
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user.rating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-yellow-400">⭐</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewUser(user.id)}
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

      {/* User Details Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl m-4">
        <div className="no-scrollbar relative w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              User Details
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

          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex-shrink-0">
                  {fixImageUrl(selectedUser.profileImg) ? (
                    <Image
                      className="h-16 w-16 rounded-full"
                      src={fixImageUrl(selectedUser.profileImg)!}
                      alt={selectedUser.fullName}
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-500 text-white font-semibold text-xl">
                      {selectedUser.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedUser.fullName}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKycStatusColor(selectedUser.kycStatus)}`}>
                      KYC: {selectedUser.kycStatus}
                    </span>
                    {selectedUser.isProvider && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Provider
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Information
                    </label>
                    <div className="mt-1 space-y-2">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Phone:</strong> {selectedUser.contact}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Verified:</strong> {selectedUser.contactVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <div className="mt-1 space-y-2">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Address:</strong> {selectedUser.location}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Nationality:</strong> {selectedUser.nationality}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Information
                    </label>
                    <div className="mt-1 space-y-2">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Role:</strong> {selectedUser.role}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Rating:</strong> {selectedUser.rating.toFixed(1)} ⭐
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Opportunities:</strong> {selectedUser.opportunities}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Languages
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedUser.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full dark:bg-gray-800 dark:text-gray-300"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Member Since
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
