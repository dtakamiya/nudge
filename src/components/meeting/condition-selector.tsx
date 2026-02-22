"use client";

type ConditionField = "conditionHealth" | "conditionMood" | "conditionWorkload";

interface ConditionAxis {
  field: ConditionField;
  label: string;
  icon: string;
  options: { value: number; label: string }[];
}

const CONDITION_AXES: ConditionAxis[] = [
  {
    field: "conditionHealth",
    label: "体調",
    icon: "🏥",
    options: [
      { value: 1, label: "とても悪い" },
      { value: 2, label: "悪い" },
      { value: 3, label: "普通" },
      { value: 4, label: "良い" },
      { value: 5, label: "とても良い" },
    ],
  },
  {
    field: "conditionMood",
    label: "気分",
    icon: "💭",
    options: [
      { value: 1, label: "とても悪い" },
      { value: 2, label: "悪い" },
      { value: 3, label: "普通" },
      { value: 4, label: "良い" },
      { value: 5, label: "とても良い" },
    ],
  },
  {
    field: "conditionWorkload",
    label: "業務量",
    icon: "📊",
    options: [
      { value: 1, label: "とても少ない" },
      { value: 2, label: "少ない" },
      { value: 3, label: "普通" },
      { value: 4, label: "多い" },
      { value: 5, label: "とても多い" },
    ],
  },
];

interface ConditionSelectorProps {
  conditionHealth: number | null;
  conditionMood: number | null;
  conditionWorkload: number | null;
  onConditionChange: (field: ConditionField, value: number | null) => void;
}

export function ConditionSelector({
  conditionHealth,
  conditionMood,
  conditionWorkload,
  onConditionChange,
}: ConditionSelectorProps) {
  const currentValues: Record<ConditionField, number | null> = {
    conditionHealth,
    conditionMood,
    conditionWorkload,
  };

  const handleSelect = (field: ConditionField, optionValue: number) => {
    const current = currentValues[field];
    onConditionChange(field, current === optionValue ? null : optionValue);
  };

  return (
    <div className="space-y-3">
      {CONDITION_AXES.map((axis) => {
        const currentValue = currentValues[axis.field];
        return (
          <div key={axis.field} className="flex items-center gap-3">
            <div className="flex w-20 shrink-0 items-center gap-1">
              <span className="text-base">{axis.icon}</span>
              <span className="text-sm font-medium text-slate-700">{axis.label}</span>
            </div>
            <div className="flex items-center gap-1">
              {axis.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-label={`${axis.label}: ${option.label}`}
                  aria-pressed={currentValue === option.value}
                  onClick={() => handleSelect(axis.field, option.value)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary ${
                    currentValue === option.value
                      ? "bg-primary text-white ring-2 ring-primary scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option.value}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
