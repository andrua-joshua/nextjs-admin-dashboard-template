"use client";
import React, { useState, useEffect, useRef } from "react";
import { getAllUsers } from "@/lib/auth";
import { User } from "@/config/api";
import Image from "next/image";

interface UserSearchProps {
  onSelect: (user: User) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function UserSearch({ 
  onSelect, 
  placeholder = "Search users...", 
  className = "",
  disabled = false 
}: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadAllUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers(0, 100); // Load more users for search
      setAllUsers(response.users);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    const filtered = allUsers.filter(user => 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setUsers(filtered);
  };

  useEffect(() => {
    if (allUsers.length === 0) {
      loadAllUsers();
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, allUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user: User) => {
    setSelectedUser(user);
    setQuery(user.fullName);
    setIsOpen(false);
    onSelect(user);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedUser(null);
    setUsers([]);
    setIsOpen(false);
    onSelect(null as any);
  };

  const handleInputFocus = () => {
    if (users.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
          </div>
        )}
        {selectedUser && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && users.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
              Select a user ({users.length} found)
            </div>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelect(user)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors duration-150 group"
              >
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

                    const profileImg = user.profileImg ?? undefined;
                    const hasError = imageErrorMap[String(user.id)];
                    
                    if (profileImg && isValidImageUrl(profileImg) && !hasError) {
                      return (
                        <Image
                          className="h-12 w-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-brand-300 dark:group-hover:ring-brand-500 transition-all duration-150"
                          src={profileImg}
                          alt={user.fullName || 'User'}
                          width={48}
                          height={48}
                          onError={() => {
                            setImageErrorMap(prev => ({ ...prev, [String(user.id)]: true }));
                          }}
                        />
                      );
                    } else {
                      return (
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-500 text-white font-semibold text-lg ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-brand-300 dark:group-hover:ring-brand-500 transition-all duration-150">
                          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-150">
                    {user.fullName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.location}
                    </span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.isProvider 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {user.isProvider ? 'Provider' : 'User'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.kycStatus === 'VERIFIED' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : user.kycStatus === 'INPROGRESS'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {user.kycStatus}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    ID: {user.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.trim() && !isLoading && users.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">No users found</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Try searching with a different term</div>
          </div>
        </div>
      )}
    </div>
  );
}
