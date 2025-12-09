import { Icon } from "@iconify/react";

interface EmptyStateProps {
    icon: string;
    message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Icon icon={icon} className="text-4xl text-default-300" />
            <p className="text-sm text-default-500">{message}</p>
        </div>
    );
}
