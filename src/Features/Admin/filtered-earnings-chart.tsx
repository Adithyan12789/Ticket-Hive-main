import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface EarningsData {
  date: string;
  earnings: number;
}

interface FilteredEarningsChartProps {
  data: EarningsData[];
  filter: "all" | "monthly" | "yearly";
  onFilterChange: (filter: "all" | "monthly" | "yearly") => void;
}

export function FilteredEarningsChart({ data, filter, onFilterChange }: FilteredEarningsChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Total Earnings
        </h3>
        <div className="flex rounded-lg shadow-sm">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-4 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-l-lg transition-colors 
              ${filter === "all"
                ? "bg-blue-600 text-white border-blue-600 dark:border-blue-600"
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
          >
            All Time
          </button>
          <button
            onClick={() => onFilterChange("monthly")}
            className={`px-4 py-1.5 text-sm font-medium border-t border-b border-r border-gray-200 dark:border-gray-600 transition-colors 
              ${filter === "monthly"
                ? "bg-blue-600 text-white border-blue-600 dark:border-blue-600"
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => onFilterChange("yearly")}
            className={`px-4 py-1.5 text-sm font-medium border-t border-b border-r border-gray-200 dark:border-gray-600 rounded-r-lg transition-colors 
              ${filter === "yearly"
                ? "bg-blue-600 text-white border-blue-600 dark:border-blue-600"
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="p-6 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => value.split("-")[1] || value}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value}`}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              dx={-10}
            />
            <Tooltip
              formatter={(value: number) => `₹${value}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)' }}
              itemStyle={{ color: 'var(--tooltip-text, #374151)' }}
            />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#2563eb"
              strokeWidth={3}
              activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
              dot={{ r: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
