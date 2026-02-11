"use client";
import React, { useState, useEffect } from "react";
import { 
  getAllUsers, 
  getAllOpportunities
} from "@/lib/auth";
import { User, Opportunity } from "@/config/api";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import Image from "next/image";

interface DashboardStats {
  totalUsers: number;
  totalOpportunities: number;
  activeOpportunities: number;
  totalBudget: number;
  averageBudget: number;
  verifiedUsers: number;
  providers: number;
  kycStats: {
    verified: number;
    inProgress: number;
    pending: number;
    failed: number;
  };
  topServices: Array<{
    service: string;
    count: number;
  }>;
  recentUsers: User[];
  recentOpportunities: Opportunity[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Fetch users and opportunities in parallel
      const [usersResponse, opportunitiesResponse] = await Promise.all([
        getAllUsers(0, 100), // Get more users for stats
        getAllOpportunities()
      ]);

      const users = usersResponse.users || [];
      let opportunities = opportunitiesResponse.opportunities || [];
      
      // Defensive: ensure opportunities is an array
      if (!Array.isArray(opportunities)) {
        console.error('Opportunities response is not an array:', opportunitiesResponse);
        opportunities = [];
      }

      // Calculate KYC stats
      const kycStats = {
        verified: users.filter(user => user.kycStatus === 'VERIFIED').length,
        inProgress: users.filter(user => user.kycStatus === 'INPROGRESS').length,
        pending: users.filter(user => user.kycStatus === 'PENDING').length,
        failed: users.filter(user => user.kycStatus === 'FAILED').length,
      };

      // Calculate service stats
      const serviceCounts: { [key: string]: number } = {};
      opportunities.forEach(opp => {
        serviceCounts[opp.service] = (serviceCounts[opp.service] || 0) + 1;
      });

      const topServices = Object.entries(serviceCounts)
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate financial stats
      const totalBudget = opportunities.reduce((sum, opp) => sum + opp.budget, 0);
      const averageBudget = opportunities.length > 0 ? totalBudget / opportunities.length : 0;

      const dashboardStats: DashboardStats = {
        totalUsers: users.length,
        totalOpportunities: opportunities.length,
        activeOpportunities: opportunities.filter(opp => opp.isActive).length,
        totalBudget,
        averageBudget,
        verifiedUsers: users.filter(user => user.contactVerified).length,
        providers: users.filter(user => user.isProvider).length,
        kycStats,
        topServices,
        recentUsers: users.slice(0, 5),
        recentOpportunities: opportunities.slice(0, 5),
      };

      setStats(dashboardStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      month: 'short',
      day: 'numeric',
    });
  };

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
        <PageBreadCrumb pageTitle="Dashboard" />
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Dashboard" />

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/20">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/users" 
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all users →
            </Link>
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Opportunities
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalOpportunities}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/20">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/opportunities" 
              className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              View all opportunities →
            </Link>
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Budget Value
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalBudget)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full dark:bg-yellow-900/20">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Avg: {formatCurrency(stats.averageBudget)}
            </p>
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Service Providers
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.providers}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900/20">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {((stats.providers / stats.totalUsers) * 100).toFixed(1)}% of users
            </p>
          </div>
        </div>
      </div>

      {/* KYC Status Overview */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          KYC Status Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.kycStats.verified}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.kycStats.inProgress}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.kycStats.pending}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.kycStats.failed}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Failed</div>
          </div>
        </div>
      </div>

      {/* Top Services and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Services */}
        <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Services
          </h3>
          <div className="space-y-3">
            {stats.topServices.map((service, index) => (
              <div key={service.service} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-brand-100 text-brand-600 rounded-full dark:bg-brand-900/20 dark:text-brand-400">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.service}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {service.count} opportunities
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Users
            </h3>
            <Link 
              href="/users" 
              className="text-sm text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="flex-shrink-0">
  {(() => {
    // Validate the profileImg URL
    const isValidImageUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    };

    const profileImg = user.profileImg ?? undefined;
    const hasError = imageErrorMap[String(user.id)];
    
    if (profileImg && isValidImageUrl(profileImg) && !hasError) {
      return (
        <Image
          className="h-8 w-8 rounded-full"
          src={profileImg}
          alt={user.fullName || 'User'}
          width={32}
          height={32}
          onError={() => {
            // Mark this user's image as failed and render fallback
            setImageErrorMap(prev => ({ ...prev, [String(user.id)]: true }));
          }}
        />
      );
    } else {
      // Fallback to initial when no valid image or image failed to load
      return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-500 text-white font-semibold text-sm">
          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      );
    }
  })()}
</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.kycStatus === 'VERIFIED' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : user.kycStatus === 'INPROGRESS'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {user.kycStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Opportunities */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Opportunities
          </h3>
          <Link 
            href="/opportunities" 
            className="text-sm text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Title
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Client
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Service
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Budget
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOpportunities.map((opportunity) => (
                <tr key={opportunity.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {opportunity.title || 'Untitled'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(opportunity.createdAt)}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {opportunity.user.fullName}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {opportunity.service}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(opportunity.budget)}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      opportunity.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {opportunity.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
