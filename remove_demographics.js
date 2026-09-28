const fs = require('fs');
let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Remove import
content = content.replace(/import \{ EvotingDemographics \} from "@\/components\/analytics\/EvotingDemographics";\r?\n/, '');

// Revert grid layout to single column
const gridRegex = /<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">\r?\n\s+<div className="lg:col-span-2">\r?\n\s+<EvotingLeaderboard data=\{leaderboard\} maxHighlight=\{13\} \/>\r?\n\s+<\/div>\r?\n\s+<div className="lg:col-span-1">\r?\n\s+<EvotingDemographics data=\{demographics\} totalVoters=\{stats\.totalVoters\} \/>\r?\n\s+<\/div>\r?\n\s+<\/div>/;
content = content.replace(gridRegex, '<div className="grid grid-cols-1 gap-6">\n        <EvotingLeaderboard data={leaderboard} maxHighlight={13} />\n      </div>');

fs.writeFileSync('src/app/admin/page.tsx', content);
