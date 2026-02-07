"use client";
import React, { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { getUserWalletAccount, getUserTransactions, makeDeposit, makeWithdraw } from "@/lib/auth";

export default function WalletsPage() {
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const acc = await getUserWalletAccount();
        setAccount(acc);
      } catch (err) {
        setAccount(null);
      }
      try {
        const tx = await getUserTransactions(0, 20);
        setTransactions(tx?.transactions || tx?.data || tx || []);
      } catch (err) {
        setTransactions([]);
      }
      setLoading(false);
    })();
  }, []);

  const handleDeposit = async () => {
    try {
      await makeDeposit({ amount: 1000, paymentMethod: 'MOBILE_MONEY' });
      // refresh
      const acc = await getUserWalletAccount();
      setAccount(acc);
    } catch (err) {}
  };

  const handleWithdraw = async () => {
    try {
      await makeWithdraw({ amount: 500, paymentMethod: 'MOBILE_MONEY' });
      const acc = await getUserWalletAccount();
      setAccount(acc);
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Wallets" />
      {loading ? (
        <div className="p-8">Loading...</div>
      ) : (
        <div className="p-4 border rounded-lg space-y-4">
          <div>
            <h4 className="font-semibold">Account</h4>
            <div className="text-sm">Balance: {account?.balance ?? 'N/A'}</div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleDeposit} className="btn btn-primary">Test Deposit</button>
            <button onClick={handleWithdraw} className="btn btn-outline">Test Withdraw</button>
          </div>

          <div>
            <h4 className="font-semibold">Transactions</h4>
            {transactions.length === 0 ? (
              <div className="text-sm text-gray-500">No transactions</div>
            ) : (
              <ul className="space-y-2">
                {transactions.map((t: any, idx: number) => (
                  <li key={idx} className="text-sm">{JSON.stringify(t)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
