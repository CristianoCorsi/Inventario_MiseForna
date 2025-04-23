import { ReactNode } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface QuickActionProps {
  title: string;
  description: string;
  icon: ReactNode;
  linkText: string;
  linkHref: string;
}

export default function QuickAction({
  title,
  description,
  icon,
  linkText,
  linkHref
}: QuickActionProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-sm text-gray-600">{description}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <Link href={linkHref} className="font-medium text-secondary hover:text-blue-900">
            {linkText}
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
