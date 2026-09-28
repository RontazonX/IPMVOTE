const fs = require('fs');

let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

content = content.replace(
  'import { GlobalParticipationChart } from "@/components/analytics/GlobalParticipationChart";',
  'import { GlobalParticipationChart } from "@/components/analytics/GlobalParticipationChart";\nimport { EvotingDemographics } from "@/components/analytics/EvotingDemographics";'
);

content = content.replace(
  'const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);',
  'const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);\n  const [demographics, setDemographics] = useState<{region: string, count: number}[]>([]);'
);

content = content.replace(
  'setLeaderboard(board);\n        }\n      }\n      setLoading(false);',
  `setLeaderboard(board);
        }

        const { data: votersList } = await supabase.from("voters").select("asal_pimpinan").eq("election_id", eId);
        if (votersList) {
          const regionCounts = {};
          votersList.forEach(v => {
            const region = v.asal_pimpinan || "Lainnya";
            regionCounts[region] = (regionCounts[region] || 0) + 1;
          });
          const demoData = Object.keys(regionCounts).map(k => ({ region: k, count: regionCounts[k] }));
          setDemographics(demoData);
        }
      }
      setLoading(false);`
);

content = content.replace(
  '<div className="grid grid-cols-1 gap-6">\n        <EvotingLeaderboard data={leaderboard} maxHighlight={13} />\n      </div>',
  `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvotingLeaderboard data={leaderboard} maxHighlight={13} />
        </div>
        <div className="lg:col-span-1">
          <EvotingDemographics data={demographics} totalVoters={stats.totalVoters} />
        </div>
      </div>`
);

// If the above replace for leaderboard/loading fails due to CRLF, let's try a regex approach
if (content.indexOf('EvotingDemographics data={demographics}') === -1) {
    content = content.replace(
        /setLeaderboard\(board\);\r?\n\s+\}\r?\n\s+\}\r?\n\s+setLoading\(false\);/,
        `setLeaderboard(board);
        }

        const { data: votersList } = await supabase.from("voters").select("asal_pimpinan").eq("election_id", eId);
        if (votersList) {
          const regionCounts = {};
          votersList.forEach(v => {
            const region = v.asal_pimpinan || "Lainnya";
            regionCounts[region] = (regionCounts[region] || 0) + 1;
          });
          const demoData = Object.keys(regionCounts).map(k => ({ region: k, count: regionCounts[k] }));
          setDemographics(demoData);
        }
      }
      setLoading(false);`
    );
    
    content = content.replace(
        /<div className="grid grid-cols-1 gap-6">\r?\n\s+<EvotingLeaderboard data=\{leaderboard\} maxHighlight=\{13\} \/>\r?\n\s+<\/div>/,
        `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvotingLeaderboard data={leaderboard} maxHighlight={13} />
        </div>
        <div className="lg:col-span-1">
          <EvotingDemographics data={demographics} totalVoters={stats.totalVoters} />
        </div>
      </div>`
    );
}

fs.writeFileSync('src/app/admin/page.tsx', content);
