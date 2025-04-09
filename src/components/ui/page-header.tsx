
import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headerVariants = cva("mb-6", {
  variants: {
    variant: {
      default: "",
      separator: "pb-4 border-b",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface PageHeaderProps extends VariantProps<typeof headerVariants> {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const PageHeader = ({
  title,
  description,
  children,
  variant,
  className,
}: PageHeaderProps) => {
  return (
    <div className={cn(headerVariants({ variant }), className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {children && <div className="flex items-center space-x-2">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
