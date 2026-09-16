"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { BarChart3 } from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface GlobalStatsData {
  name: string;
  totalVoters: number;
  votedVoters: number;
}

interface GlobalParticipationChartProps {
  data: GlobalStatsData[];
}

export const GlobalParticipationChart = ({ data }: GlobalParticipationChartProps) => {
  const categories = data.map(d => {
    // Truncate long names for the chart x-axis
    return d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name;
  });
  
  const votedData = data.map(d => d.votedVoters);
  const unvotedData = data.map(d => d.totalVoters - d.votedVoters);

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    colors: ['#10B981', '#E2E8F0'], // Emerald for voted, Slate for unvoted
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '40%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#64748b",
          fontSize: '12px',
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748b",
          fontSize: '12px',
        }
      }
    },
    fill: {
      opacity: 1
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#64748b' }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    }
  };

  const series = [
    {
      name: 'Sudah Memilih',
      data: votedData
    },
    {
      name: 'Belum Memilih',
      data: unvotedData
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Perbandingan Partisipasi Event</h3>
          <p className="text-sm text-slate-500">Tingkat partisipasi pemilih di setiap event formatur.</p>
        </div>
        <div className="p-2 bg-brand-50 rounded-xl">
          <BarChart3 className="w-5 h-5 text-brand-600" />
        </div>
      </div>
      
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="min-w-[600px] xl:min-w-full">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-[350px] text-slate-500">
              Belum ada data event.
            </div>
          ) : (
            <Chart options={options} series={series} type="bar" height={350} />
          )}
        </div>
      </div>
    </div>
  );
};
