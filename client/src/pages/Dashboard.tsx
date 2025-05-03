// Dashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import StatCard from "@/components/dashboard/StatCard";
import ActivityList from "@/components/dashboard/ActivityList";
import QuickAction from "@/components/dashboard/QuickAction";
import AddItemModal from "@/components/inventory/AddItemModal";

export default function Dashboard() {
  const { t } = useTranslation();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      {/* Page Header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t("dashboard.title")}
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Export
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => setIsAddItemModalOpen(true)}
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {t("dashboard.addItem")}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.totalItems")}
          value={
            statsLoading ? t("app.loading") : String(stats?.totalInventory || 0)
          }
          icon={
            <svg
              className="w-6 h-6 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
              ></path>
            </svg>
          }
          linkText="View all items"
          linkHref="/inventory"
        />

        <StatCard
          title={t("dashboard.itemsOnLoan")}
          value={
            statsLoading ? t("app.loading") : String(stats?.itemsOnLoan || 0)
          }
          icon={
            <svg
              className="w-6 h-6 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              ></path>
            </svg>
          }
          linkText="View all loans"
          linkHref="/loans"
        />

        <StatCard
          title={t("dashboard.overdueItems")}
          value={
            statsLoading ? t("app.loading") : String(stats?.overdueItems || 0)
          }
          valueClassName="text-accent"
          icon={
            <svg
              className="w-6 h-6 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          }
          linkText="View overdue items"
          linkHref="/loans?filter=overdue"
        />

        <StatCard
          title="New Items (30 days)"
          value={statsLoading ? t("app.loading") : String(stats?.newItems || 0)}
          icon={
            <svg
              className="w-6 h-6 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          }
          linkText="View new items"
          linkHref="/inventory?filter=new"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">
          {t("dashboard.recentActivity")}
        </h2>
        <ActivityList
          activities={activities || []}
          isLoading={activitiesLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          title={t("dashboard.quickActions")}
          description={t("dashboard.createLoan")}
          icon={
            <svg
              className="h-6 w-6 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              ></path>
            </svg>
          }
          linkText={t("dashboard.createLoan")}
          linkHref="/qrcodes"
        />
        <QuickAction
          title="Batch Processing"
          description="Process multiple loans or returns at once"
          icon={
            <svg
              className="h-6 w-6 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              ></path>
            </svg>
          }
          linkText="Process batch"
          linkHref="/loans?batch=true"
        />

        <QuickAction
          title="Run Reports"
          description="Generate inventory reports and analytics"
          icon={
            <svg
              className="h-6 w-6 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          }
          linkText="View reports"
          linkHref="/reports"
        />
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
      />
    </div>
  );
}
