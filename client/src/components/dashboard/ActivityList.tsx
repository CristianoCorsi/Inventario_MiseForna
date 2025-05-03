import { Activity, Item } from "@shared/schema";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ChevronRightIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
}

export default function ActivityList({
  activities,
  isLoading,
}: ActivityListProps) {
  const { t } = useTranslation();
  const { data: items } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const getItemForActivity = (itemId?: number) => {
    if (!itemId || !items) return null;
    return items.find((item) => item.id === itemId);
  };

  const getActivityBadgeClass = (type: string) => {
    switch (type) {
      case "new":
        return "activity-badge-new";
      case "loan":
        return "activity-badge-loan";
      case "return":
        return "activity-badge-return";
      case "edit":
        return "activity-badge-edit";
      case "delete":
        return "activity-badge-delete";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Placeholder for empty state
  if (!isLoading && (!activities || activities.length === 0)) {
    return (
      <div className="mt-2 overflow-hidden bg-white shadow sm:rounded-md">
        <div className="px-4 py-8 text-center">
          <p className="text-gray-500">{t("dashboard.noRecentActivity")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="block hover:bg-gray-50">
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0 px-4">
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-1/4 mr-2" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="mt-2 flex">
                        <Skeleton className="h-4 w-24 mr-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </li>
            ))
          : // Actual activities
            activities.slice(0, 4).map((activity) => {
              const item = getItemForActivity(activity.itemId);

              return (
                <li key={activity.id}>
                  <Link href={item ? `/inventory/${item.id}` : "#"}>
                    <div className="block hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {item?.photoUrl ? (
                              <img
                                className="w-12 h-12 rounded-lg object-cover"
                                src={item.photoUrl}
                                alt={item.name}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-lg">
                                  {item?.name?.charAt(0) || "?"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 px-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-secondary truncate">
                                {item?.name || "Unknown Item"}
                              </p>
                              <Badge
                                className={`ml-2 ${getActivityBadgeClass(
                                  activity.activityType
                                )}`}
                              >
                                {activity.activityType.charAt(0).toUpperCase() +
                                  activity.activityType.slice(1)}
                              </Badge>
                            </div>
                            <div className="mt-1">
                              <p className="text-sm text-gray-500">
                                {activity.description}
                              </p>
                            </div>
                            <div className="mt-2 flex">
                              <span className="inline-flex items-center text-xs text-gray-500">
                                <ClockIcon className="mr-1.5 h-4 w-4 text-gray-400" />
                                {format(
                                  new Date(activity.timestamp),
                                  "MMM d, yyyy"
                                )}
                              </span>
                              {item?.location && (
                                <span className="inline-flex items-center ml-4 text-xs text-gray-500">
                                  <MapPinIcon className="mr-1.5 h-4 w-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {item.location}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
      </ul>
    </div>
  );
}
