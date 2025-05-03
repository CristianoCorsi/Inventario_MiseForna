import { ReactNode } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  linkText: string;
  linkHref: string;
  valueClassName?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  linkText,
  linkHref,
  valueClassName = "text-gray-900",
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">{icon}</div>
          <div className="flex-1 w-0 ml-5">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className={`text-2xl font-semibold ${valueClassName}`}>
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-5 py-3 bg-gray-50">
        <div className="text-sm">
          <Link
            href={linkHref}
            className="font-medium text-primary hover:text-blue-900"
          >
            {linkText}
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
