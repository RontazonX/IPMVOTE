"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Activity } from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface EvotingTrendChartProps {
  categories: string[];
  data: number[];
}

export const EvotingTrendChart = ({ categories, data }: EvotingTrendChartProps) => {
  const options: ApexOptions = {
    legend: { show: false },
    colors: ["#6366f1"], // brand color (indigo)
    chart: {
      fontFamily: "inherit",
      height: 310,
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      borderColor: 'rgba(148, 163, 184, 0.1)',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${val} suara` }
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: '12px',
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
        },
        formatter: (val) => Math.floor(val).toString()
      },
    },
  };

  const series = [{ name: "Suara Masuk", data: data }];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Waktu Pemilihan (Peak Hours)</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tren partisipasi berdasarkan waktu.</p>
        </div>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="min-w-[500px] xl:min-w-full">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-[310px] text-slate-500">
              Belum ada data waktu pemilihan.
            </div>
          ) : (
            <Chart options={options} series={series} type="area" height={310} />
          )}
        </div>
      </div>
    </div>
  );
};
