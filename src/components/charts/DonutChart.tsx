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
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
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

      <div className="-mx-8 flex items-center justify-center gap-y-3">
        <div className="w-full px-8">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-emerald-500"></span>
            <p className="flex w-full justify-between text-sm font-medium text-slate-600">
              <span> Sudah Memilih </span>
              <span> {votedPercent}% </span>
            </p>
          </div>
        </div>
        <div className="w-full px-8">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-slate-500"></span>
            <p className="flex w-full justify-between text-sm font-medium text-slate-600">
              <span> Belum Memilih </span>
              <span> {100 - votedPercent}% </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
