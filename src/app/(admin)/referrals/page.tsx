"use client";
import React, { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { generateReferral, getMyReferralCodes, getReferralClaims, getMyReferralClaims } from "@/lib/auth";

export default function ReferralsPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCodes = async () => {
    try {
      const res = await getMyReferralCodes();
      let items: any = res?.codes || res?.data || res || [];
      if (!Array.isArray(items)) {
        items = items ? [items] : [];
      }
      setCodes(items);
    } catch (err) {
      setCodes([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadCodes();
      setLoading(false);
    })();
  }, []);

  const handleGenerate = async () => {
    try {
      await generateReferral();
      await loadCodes();
    } catch (err) {
      // ignore
    }
  };

  const viewClaims = async (code: string) => {
    try {
      const res = await getReferralClaims(code);
      let items: any = res?.claims || res?.data || res || [];
      if (!Array.isArray(items)) {
        items = items ? [items] : [];
      }
      setClaims(items);
    } catch (err) {
      setClaims([]);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Referrals" />
      <div className="flex items-center gap-4">
        <button onClick={handleGenerate} className="btn btn-primary">Generate Code</button>
      </div>
      {loading ? (
        <div className="p-4">Loading...</div>
      ) : (
        <div className="p-4 border rounded-lg">
          {codes.length === 0 ? (
            <div>No referral codes</div>
          ) : (
            <ul className="space-y-2">
              {codes.map((c: any) => (
                <li key={c.id || c.code} className="flex items-center justify-between">
                  <div>{c.code || c.referralCode}</div>
                  <div>
                    <button onClick={() => viewClaims(c.code || c.referralCode)} className="text-sm text-brand-600">View claims</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {claims && (
            <div className="mt-4">
              <h4 className="font-semibold">Claims</h4>
              {claims.length === 0 ? (
                <div>No claims</div>
              ) : (
                <ul className="space-y-1">
                  {claims.map((cl: any, idx: number) => (
                    <li key={idx} className="text-sm">{JSON.stringify(cl)}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
