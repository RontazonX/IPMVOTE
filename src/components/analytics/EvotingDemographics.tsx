import React from 'react';
import { MapPin, Users } from 'lucide-react';

interface DemographicData {
  region: string;
  count: number;
}

interface EvotingDemographicsProps {
  data: DemographicData[];
  totalVoters: number;
}

export const EvotingDemographics: React.FC<EvotingDemographicsProps> = ({ data, totalVoters }) => {
  // Sort by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Partisipasi per Wilayah</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Distribusi pemilih berdasarkan asal pimpinan.</p>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedData.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Belum ada data wilayah.
          </div>
        ) : (
          sortedData.map((item, index) => {
            const percentage = totalVoters > 0 ? ((item.count / totalVoters) * 100).toFixed(1) : "0.0";
            
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{item.region}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{percentage}% dari total</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
