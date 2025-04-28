// ItemDetail.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeGenerator } from "@/components/inventory/QRCodeGenerator";
import { ItemForm } from "@/components/inventory/ItemForm";
import { LoanForm } from "@/components/loans/LoanForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Item, Activity, Loan } from "@shared/schema";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  PackageIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-react";

export default function ItemDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoaning, setIsLoaning] = useState(false);
  const itemId = parseInt(id);

  const { data: item, isLoading: itemLoading } = useQuery<Item>({
    queryKey: [`/api/items/${itemId}`],
    enabled: !isNaN(itemId),
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<
    Activity[]
  >({
    queryKey: [`/api/activities/item/${itemId}`],
    enabled: !isNaN(itemId),
  });

  const { data: loans, isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: [`/api/loans/item/${itemId}`],
    enabled: !isNaN(itemId),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async () => apiRequest("DELETE", `/api/items/${itemId}`),
    onSuccess: () => {
      toast({
        title: t("item.delete"),
        description: t("item.delete") + " " + t("item.details"),
      });
      navigate("/inventory");
    },
    onError: (error) => {
      toast({
        title: t("app.error"),
        description: (error as Error).message || t("app.error"),
        variant: "destructive",
      });
    },
  });

  if (itemLoading) {
    return (
      <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/inventory")}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t("app.back")}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            {t("item.details")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{t("app.error")}</p>
          <div className="mt-6">
            <Button onClick={() => navigate("/inventory")}>
              {t("app.back")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success/20 text-success";
      case "loaned":
        return "bg-primary/20 text-primary";
      case "maintenance":
        return "bg-gray-500/20 text-gray-500";
      default:
        return "bg-muted-foreground/20 text-muted-foreground";
    }
  };

  const handleReturnLoan = async (loanId: number) => {
    try {
      await apiRequest("PUT", `/api/loans/${loanId}/return`, {
        returnDate: new Date(),
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/loans/item/${itemId}`],
      });
      queryClient.invalidateQueries({ queryKey: [`/api/items/${itemId}`] });
      queryClient.invalidateQueries({
        queryKey: [`/api/activities/item/${itemId}`],
      });
      toast({
        title: t("item.loanHistory"),
        description: t("loans.return"),
      });
    } catch {
      toast({
        title: t("app.error"),
        description: t("app.error"),
        variant: "destructive",
      });
    }
  };

  const sortedLoans = [...(loans || [])].sort((a, b) => {
    const aActive = a.status === "active" || a.status === "overdue";
    const bActive = b.status === "active" || b.status === "overdue";
    if (aActive && !bActive) return -1;
    if (bActive && !aActive) return 1;
    return new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime();
  });

  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/inventory")}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          {t("app.back")}
        </Button>

        <div className="flex space-x-2">
          {isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t("app.cancel")}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={item.status === "loaned"}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                {t("item.edit")}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={item.status === "loaned"}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    {t("app.delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("app.confirm")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("app.confirm")} {item.name}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteItemMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteItemMutation.isPending
                        ? t("app.loading")
                        : t("app.delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <ItemForm
          item={item}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            queryClient.invalidateQueries({
              queryKey: [`/api/items/${itemId}`],
            });
          }}
        />
      ) : isLoaning ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("loans.create")}</CardTitle>
            <CardDescription>{t("loans.create")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoanForm
              itemId={item.id}
              onCancel={() => setIsLoaning(false)}
              onSuccess={() => {
                setIsLoaning(false);
                queryClient.invalidateQueries({
                  queryKey: [`/api/items/${itemId}`],
                });
                queryClient.invalidateQueries({
                  queryKey: [`/api/loans/item/${itemId}`],
                });
                queryClient.invalidateQueries({
                  queryKey: [`/api/activities/item/${itemId}`],
                });
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{item.name}</CardTitle>
                    <CardDescription>
                      {t("item.serialNumber")}: {item.itemId}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadgeClass(item.status)}>
                    {t(`inventory.status.${item.status}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {item.description ? (
                    <p className="text-gray-700">{item.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      {t("validation.required")}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center">
                    <PackageIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">
                        {t("item.origin")}
                      </p>
                      <p className="font-medium">
                        {item.origin.charAt(0).toUpperCase() +
                          item.origin.slice(1)}
                        {item.donorName && ` (${item.donorName})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">
                        {t("item.purchaseDate")}
                      </p>
                      <p className="font-medium">
                        {item.dateAdded
                          ? format(new Date(item.dateAdded), "MMM d, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">
                        {t("item.location")}
                      </p>
                      <p className="font-medium">
                        {item.location || t("app.noResults")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabs for Activities and Loans */}
                <Tabs defaultValue="activities" className="mt-8">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="activities">
                      {t("item.activityHistory")}
                    </TabsTrigger>
                    <TabsTrigger value="loans">
                      {t("item.loanHistory")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="activities" className="mt-4">
                    {activitiesLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="border rounded-md p-4">
                            <Skeleton className="h-5 w-1/4 mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : activities && activities.length > 0 ? (
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="border rounded-md p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge
                                className={`activity-badge-${activity.activityType}`}
                              >
                                {t(`activity.${activity.activityType}`)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {format(
                                  new Date(activity.timestamp),
                                  "MMM d, yyyy h:mm a",
                                )}
                              </span>
                            </div>
                            <p className="text-gray-700">
                              {activity.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {t("app.noResults")}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="loans" className="mt-4">
                    {loansLoading ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="border rounded-md p-4">
                            <Skeleton className="h-5 w-1/4 mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : sortedLoans && sortedLoans.length > 0 ? (
                      <div className="space-y-4">
                        {sortedLoans.map((loan) => (
                          <div key={loan.id} className="border rounded-md p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="font-medium">
                                  {loan.borrowerName}
                                </span>
                              </div>
                              <Badge
                                className={
                                  loan.status === "active"
                                    ? "bg-primary/20 text-primary"
                                    : loan.status === "overdue"
                                      ? "bg-destructive/20 text-destructive"
                                      : "bg-success/20 text-success"
                                }
                              >
                                {t(`loans.status.${loan.status}`)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                              <div>
                                <p className="text-gray-500">
                                  {t("loans.dueDate")}
                                </p>
                                <p
                                  className={
                                    loan.status === "overdue"
                                      ? "text-destructive font-medium"
                                      : ""
                                  }
                                >
                                  {format(
                                    new Date(loan.dueDate),
                                    "MMM d, yyyy",
                                  )}
                                </p>
                              </div>
                              {loan.returnDate && (
                                <div className="col-span-2">
                                  <p className="text-gray-500">
                                    {t("loans.returnDate")}
                                  </p>
                                  <p>
                                    {format(
                                      new Date(loan.returnDate),
                                      "MMM d, yyyy",
                                    )}
                                  </p>
                                </div>
                              )}
                              {loan.notes && (
                                <div className="col-span-2 mt-2">
                                  <p className="text-gray-700">{loan.notes}</p>
                                </div>
                              )}
                            </div>

                            {(loan.status === "active" ||
                              loan.status === "overdue") && (
                              <div className="mt-4 flex justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => handleReturnLoan(loan.id)}
                                >
                                  {t("loans.return")}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {t("app.noResults")}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                {item.status === "available" ? (
                  <Button onClick={() => setIsLoaning(true)} size="lg">
                    {t("loans.create")}
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" disabled>
                    {t("app.cancel")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("qrcode.title")}</CardTitle>
                <CardDescription>{t("qrcode.scanned")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <QRCodeGenerator
                  itemId={item.itemId}
                  qrValue={item.qrCode || item.itemId}
                  name={item.name}
                  item={item}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
