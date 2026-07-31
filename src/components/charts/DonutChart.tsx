"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface DonutChartProps {
  voted: number;
  notVoted: number;
}

export default function DonutChart({ voted, notVoted }: DonutChartProps) {
  const total = voted + notVoted;
  const votedPercent = total === 0 ? 0 : Math.round((voted / total) * 100);
  
  const options: ApexOptions = {
    chart: {
      fontFamily: "inherit",
      type: "donut",
    },
    colors: ["#10B981", "#64748B"],
    labels: ["Sudah Memilih", "Belum Memilih"],
    legend: {
      show: false,
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

  const series = [voted, notVoted];

  return (
    <div className="col-span-12 rounded-2xl border border-slate-200 bg-white px-5 pt-7 pb-5 shadow-sm sm:px-7.5 xl:col-span-4">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-bold text-slate-800">
            Partisipasi Pemilih
          </h4>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="block h-3 w-3 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-medium text-slate-600">Sudah Memilih</span>
          </div>
          <span className="text-sm font-bold text-slate-800">{votedPercent}%</span>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="block h-3 w-3 rounded-full bg-slate-500"></span>
            <span className="text-sm font-medium text-slate-600">Belum Memilih</span>
          </div>
          <span className="text-sm font-bold text-slate-800">{100 - votedPercent}%</span>
        </div>
      </div>
    </div>
  );
}
