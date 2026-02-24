import React from "react";

export const rechartsMock = {
  ResponsiveContainer: ({
    children,
  }: {
    children?: React.ReactNode;
    width?: number | string;
    height?: number | string;
  }) => React.createElement("div", null, children),
  BarChart: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "bar-chart" }, children),
  LineChart: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "line-chart" }, children),
  PieChart: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "pie-chart" }, children),
  AreaChart: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "area-chart" }, children),
  Bar: () => null,
  Line: () => null,
  Pie: () => null,
  Area: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
};
