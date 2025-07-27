import { Toaster as Sonner, ToasterProps } from "sonner";

const CustomToaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-left"
      richColors
      closeButton
      duration={4000}
      expand={true}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "hsl(var(--success))",
          "--success-text": "hsl(var(--success-foreground))",
          "--success-border": "hsl(var(--success))",
          "--error-bg": "hsl(var(--destructive))",
          "--error-text": "hsl(var(--destructive-foreground))",
          "--error-border": "hsl(var(--destructive))",
          "--warning-bg": "hsl(var(--warning))",
          "--warning-text": "hsl(var(--warning-foreground))",
          "--warning-border": "hsl(var(--warning))",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { CustomToaster };
