import React from 'react';
import Image from 'next/image';

interface LeaderboardData {
  candidateId: string;
  name: string;
  no: number;
  votes: number;
  photo_url?: string;
}

interface EvotingLeaderboardProps {
  data: LeaderboardData[];
  maxHighlight?: number;
}

export const EvotingLeaderboard: React.FC<EvotingLeaderboardProps> = ({ data, maxHighlight = 13 }) => {
  const maxVotes = data.length > 0 ? data[0].votes : 1;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Perolehan Suara Sementara</h3>
          <p className="text-sm text-slate-500">Peringkat kandidat formatur berdasarkan suara masuk.</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {data.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Belum ada suara masuk.
          </div>
        ) : (
          data.map((candidate, index) => {
            const isHighlighted = index < maxHighlight;
            const percentage = (candidate.votes / maxVotes) * 100;
            
            return (
              <div 
                key={candidate.candidateId} 
                className={`relative overflow-hidden rounded-xl p-4 transition-all ${
                  isHighlighted 
                    ? 'bg-brand-50/50 border border-brand-100' 
                    : 'bg-slate-50 border border-slate-100'
                }`}
              >
                {/* Progress bar background */}
                <div 
                  className={`absolute top-0 left-0 h-full opacity-10 ${isHighlighted ? 'bg-brand-500' : 'bg-slate-400'}`}
                  style={{ width: `${percentage}%` }}
                />
                
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-200 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      isHighlighted ? 'bg-brand-100 text-brand-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                    
                    {candidate.photo_url ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 relative">
                        <Image src={candidate.photo_url} alt={candidate.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold">
                        {candidate.no}
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{candidate.name}</h4>
                      <p className="text-xs text-slate-500">No. Urut {candidate.no}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900">{candidate.votes}</div>
                    <div className="text-xs text-slate-500">suara</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
