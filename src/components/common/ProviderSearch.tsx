"use client";
import React, { useState, useEffect, useRef } from "react";
import { searchProvider } from "@/lib/auth";
import { Provider } from "@/config/api";
import Image from "next/image";

interface ProviderSearchProps {
  onSelect: (provider: Provider) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function ProviderSearch({ 
  onSelect, 
  placeholder = "Search providers...", 
  className = "",
  disabled = false 
}: ProviderSearchProps) {
  const [query, setQuery] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchProviders = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProviders([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await searchProvider(searchQuery, 0, 10);
      setProviders(response.providers);
    } catch (error) {
      console.error("Error searching providers:", error);
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchProviders(query);
      } else {
        setProviders([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setQuery(provider.providerName);
    setIsOpen(false);
    onSelect(provider);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedProvider(null);
    setProviders([]);
    setIsOpen(false);
    onSelect(null as any);
  };

  const handleInputFocus = () => {
    if (providers.length > 0) {
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
        {selectedProvider && !disabled && (
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

      {isOpen && providers.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
              Select a provider ({providers.length} found)
            </div>
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => handleSelect(provider)}
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

                    const profileImg = provider.user.profileImg ?? undefined;
                    const hasError = imageErrorMap[String(provider.user.id)];
                    
                    if (profileImg && isValidImageUrl(profileImg) && !hasError) {
                      return (
                        <Image
                          className="h-12 w-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-brand-300 dark:group-hover:ring-brand-500 transition-all duration-150"
                          src={profileImg}
                          alt={provider.providerName || 'Provider'}
                          width={48}
                          height={48}
                          onError={() => {
                            setImageErrorMap(prev => ({ ...prev, [String(provider.user.id)]: true }));
                          }}
                        />
                      );
                    } else {
                      return (
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-500 text-white font-semibold text-lg ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-brand-300 dark:group-hover:ring-brand-500 transition-all duration-150">
                          {provider.providerName?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-150">
                    {provider.providerName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {provider.user.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {provider.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {provider.services.length} services
                    </span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {provider.contracts} contracts
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {provider.services.slice(0, 3).map((service) => (
                      <span key={service.id} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                        {service.title}
                      </span>
                    ))}
                    {provider.services.length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                        +{provider.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    ID: {provider.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.trim() && !isLoading && providers.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">No providers found</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Try searching with a different term</div>
          </div>
        </div>
      )}
    </div>
  );
}
