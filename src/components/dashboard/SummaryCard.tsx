// src/components/dashboard/SummaryCard.tsx
import React from 'react';
import { Card, CardHeader, CardBody, Spinner } from "@heroui/react";

type CardColor = "primary" | "secondary" | "success" | "warning" | "danger" | "default";

interface SummaryCardProps {
  title: string;
  value: number | string | null | undefined;
  isLoading: boolean;
  icon?: React.ReactNode;
  color?: CardColor;
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  isLoading,
  icon,
  color = "default",
  className = ""
}) => {
  const colorClasses: Record<CardColor, string> = {
    primary:   "bg-blue-100 dark:bg-blue-900/50 border-blue-500 dark:border-blue-700",
    secondary: "bg-purple-100 dark:bg-purple-900/50 border-purple-500 dark:border-purple-700",
    success:   "bg-green-100 dark:bg-green-900/50 border-green-500 dark:border-green-700",
    warning:   "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-500 dark:border-yellow-700",
    danger:    "bg-red-100 dark:bg-red-900/50 border-red-500 dark:border-red-700",
    default:   "bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600",
  };

  const valueColorClasses: Record<CardColor, string> = {
    primary:   "text-blue-600 dark:text-blue-400",
    secondary: "text-purple-600 dark:text-purple-400",
    success:   "text-green-700 dark:text-green-400",
    warning:   "text-yellow-700 dark:text-yellow-400",
    danger:    "text-red-700 dark:text-red-400",
    default:   "text-gray-900 dark:text-white",
  };

  return (
    <Card
        shadow="md"
        className={`border-l-4 ${colorClasses[color]} ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-2 px-4">
        <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h4>
        {icon && <div className={`text-2xl ${valueColorClasses[color]} opacity-75`}>{icon}</div>}
      </CardHeader>
      <CardBody className="pt-0 pb-3 px-4">
        {isLoading ? (
          <Spinner size="sm" color={color === 'default' ? 'primary' : color} className="mt-1"/>
        ) : (
          // Cambio de <div> a <span> para el valor
          <span className={`text-3xl font-bold ${valueColorClasses[color]}`}>
            {value !== null && value !== undefined ? value.toLocaleString('es-CO') : '-'}
          </span>
        )}
      </CardBody>
    </Card>
  );
};

export default SummaryCard;