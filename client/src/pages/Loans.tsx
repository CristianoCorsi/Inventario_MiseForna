// Loans.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loan, Item } from "@shared/schema";
import { PlusIcon, FileDownIcon, ClockIcon } from "lucide-react";
import LoanCard from "@/components/loans/LoanCard";

export default function Loans() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "overdue" | "returned"
  >("all");
  const [location] = useLocation();
  const isOverdueFilter = location.includes("filter=overdue");
  const isBatchMode = location.includes("batch=true");

  useEffect(() => {
    if (isOverdueFilter) setStatusFilter("overdue");
  }, [isOverdueFilter]);

  const { data: loans, isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: [
      statusFilter === "overdue"
        ? "/api/loans/overdue"
        : statusFilter === "active"
          ? "/api/loans/active"
          : statusFilter === "returned"
            ? "/api/loans/returned"
            : "/api/loans",
    ],
  });

  const { data: items } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const filteredLoans = loans?.filter((loan) => {
    const item = items?.find((i) => i.id === loan.itemId);
    const matchesSearch =
      item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.borrowerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);
    const matchesStatus =
      statusFilter === "all" || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const overdueCount = loans?.filter((l) => l.status === "overdue").length ?? 0;

  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      {/* Page Header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t("loans.title")}
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Button variant="outline" className="mr-3">
            <FileDownIcon className="h-4 w-4 mr-2" />
            {t("app.filter")}
          </Button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("loans.create")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={isBatchMode ? "batch" : "browse"} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">{t("loans.history")}</TabsTrigger>
          <TabsTrigger value="batch">{t("loans.batch")}</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>{t("loans.title")}</CardTitle>
                  <CardDescription>{t("loans.history")}</CardDescription>
                </div>
                <div className="flex items-center">
                  <Button
                    variant={
                      statusFilter === "overdue" ? "destructive" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setStatusFilter((prev) =>
                        prev === "overdue" ? "all" : "overdue",
                      )
                    }
                    className="flex items-center gap-2"
                  >
                    <ClockIcon className="h-4 w-4" />
                    {t("loans.overdue")}
                    {overdueCount > 0 && (
                      <span className="ml-1 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                        {overdueCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  placeholder={t("app.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("app.filter")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all")}</SelectItem>
                    <SelectItem value="active">{t("loans.active")}</SelectItem>
                    <SelectItem value="overdue">
                      {t("loans.overdue")}
                    </SelectItem>
                    <SelectItem value="returned">
                      {t("loans.status.returned")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loansLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white border rounded-lg p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : filteredLoans && filteredLoans.length > 0 ? (
                <div className="space-y-4">
                  {filteredLoans.map((loan) => (
                    <LoanCard
                      key={loan.id}
                      loan={loan}
                      item={items?.find((i) => i.id === loan.itemId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t("app.noResults")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {loans?.length ? t("app.noResults") : t("loans.create")}
                  </p>
                  <div className="mt-6">
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {t("loans.create")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>{t("loans.batch")}</CardTitle>
              <CardDescription>{t("loans.batch")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="loan">
                <TabsList className="mb-6">
                  <TabsTrigger value="loan">{t("loans.create")}</TabsTrigger>
                  <TabsTrigger value="return">{t("loans.return")}</TabsTrigger>
                </TabsList>

                <TabsContent value="loan">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("loans.borrower")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("loans.borrower")}
                          </label>
                          <Input placeholder={t("loans.borrower")} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("loans.dueDate")}
                          </label>
                          <Input type="date" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email (optional)
                          </label>
                          <Input placeholder={t("validation.email")} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("loans.phone")}
                          </label>
                          <Input placeholder={t("loans.phone")} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("app.select")}
                      </h3>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <p className="text-sm text-gray-500 mb-4">
                          {t("app.noResults")}
                        </p>

                        <div className="max-h-72 overflow-y-auto border rounded-md bg-white">
                          <div className="p-4 text-center text-gray-500">
                            {t("app.noResults")}
                          </div>
                        </div>

                        <div className="mt-4">
                          <Button variant="outline" className="w-full">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            {t("app.addNew")}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2">
                        {t("app.cancel")}
                      </Button>
                      <Button disabled>{t("loans.create")}</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="return">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("loans.return")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("loans.returnDate")}
                          </label>
                          <Input
                            type="date"
                            defaultValue={
                              new Date().toISOString().split("T")[0]
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("validation.required")}
                          </label>
                          <Select defaultValue="good">
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("validation.required")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">
                                {t("validation.maxLength")}
                              </SelectItem>
                              <SelectItem value="good">
                                {t("validation.maxLength")}
                              </SelectItem>
                              <SelectItem value="fair">
                                {t("validation.maxLength")}
                              </SelectItem>
                              <SelectItem value="poor">
                                {t("validation.maxLength")}
                              </SelectItem>
                              <SelectItem value="damaged">
                                {t("validation.maxLength")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("app.select")}
                      </h3>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <p className="text-sm text-gray-500 mb-4">
                          {t("app.noResults")}
                        </p>

                        <div className="max-h-72 overflow-y-auto border rounded-md bg-white">
                          <div className="p-4 text-center text-gray-500">
                            {t("app.noResults")}
                          </div>
                        </div>

                        <div className="mt-4">
                          <Button variant="outline" className="w-full">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            {t("app.addNew")}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2">
                        {t("app.cancel")}
                      </Button>
                      <Button disabled>{t("loans.return")}</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
