import React from 'react';
import { Users, CheckCircle, Clock, UsersRound } from 'lucide-react';

interface EvotingMetricsProps {
  totalVoters: number;
  votedVoters: number;
  totalCandidates: number;
}

export const EvotingMetrics: React.FC<EvotingMetricsProps> = ({ totalVoters, votedVoters, totalCandidates }) => {
  const unvotedVoters = totalVoters - votedVoters;
  const turnoutPercentage = totalVoters > 0 ? Math.round((votedVoters / totalVoters) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500">Pemilih Terdaftar</h3>
          <div className="p-2 bg-blue-50 rounded-xl">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-900">{totalVoters}</span>
          <span className="text-sm text-slate-500 mb-1">orang</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 h-1 bg-emerald-500" style={{ width: `${turnoutPercentage}%` }} />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500">Sudah Memilih (Turnout)</h3>
          <div className="p-2 bg-emerald-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-900">{votedVoters}</span>
          <span className="text-sm font-medium text-emerald-600 mb-1">({turnoutPercentage}%)</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500">Belum Memilih</h3>
          <div className="p-2 bg-amber-50 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-900">{unvotedVoters}</span>
          <span className="text-sm text-slate-500 mb-1">orang</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500">Kandidat Formatur</h3>
          <div className="p-2 bg-purple-50 rounded-xl">
            <UsersRound className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-900">{totalCandidates}</span>
          <span className="text-sm text-slate-500 mb-1">orang</span>
        </div>
      </div>
    </div>
  );
};
