"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface BarChartProps {
  categories: string[];
  data: number[];
}

export default function BarChart({ categories, data }: BarChartProps) {
  const options: ApexOptions = {
    colors: ["#3C50E0"],
    chart: {
      fontFamily: "inherit",
      type: "bar",
      height: 335,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#64748b",
        },
      },
    },
    yaxis: {
      title: {
        text: "Jumlah Suara",
        style: {
          color: "#64748b",
        }
      },
      labels: {
        style: {
          colors: "#64748b",
        },
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " Suara";
        },
      },
    },
  };

  const series = [
    {
      name: "Perolehan Suara",
      data: data,
    },
  ];

  return (
    <div className="col-span-12 rounded-2xl border border-slate-200 bg-white px-5 pt-7 pb-5 shadow-sm sm:px-7.5 xl:col-span-8">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-bold text-slate-800">
            Statistik Perolehan Suara
          </h4>
          <p className="text-sm font-medium text-slate-500">
            Berdasarkan data langsung dari bilik suara
          </p>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}
