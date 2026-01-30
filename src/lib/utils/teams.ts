/**
 * Team colors, logos, and player data utilities
 */

// NBA Team data with official colors (muted versions for dark theme)
export const NBA_TEAMS: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  logo: string;
  abbrev: string;
}> = {
  'Los Angeles Lakers': {
    primary: '#552583',
    secondary: '#FDB927',
    accent: 'from-purple-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    abbrev: 'LAL',
  },
  'Boston Celtics': {
    primary: '#007A33',
    secondary: '#BA9653',
    accent: 'from-green-900/40 to-green-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    abbrev: 'BOS',
  },
  'Golden State Warriors': {
    primary: '#1D428A',
    secondary: '#FFC72C',
    accent: 'from-blue-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
    abbrev: 'GSW',
  },
  'Miami Heat': {
    primary: '#98002E',
    secondary: '#F9A01B',
    accent: 'from-red-900/40 to-orange-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    abbrev: 'MIA',
  },
  'Phoenix Suns': {
    primary: '#1D1160',
    secondary: '#E56020',
    accent: 'from-purple-900/40 to-orange-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    abbrev: 'PHX',
  },
  'Milwaukee Bucks': {
    primary: '#00471B',
    secondary: '#EEE1C6',
    accent: 'from-green-900/40 to-green-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    abbrev: 'MIL',
  },
  'Denver Nuggets': {
    primary: '#0E2240',
    secondary: '#FEC524',
    accent: 'from-blue-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    abbrev: 'DEN',
  },
  'Philadelphia 76ers': {
    primary: '#006BB6',
    secondary: '#ED174C',
    accent: 'from-blue-900/40 to-red-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    abbrev: 'PHI',
  },
  'Brooklyn Nets': {
    primary: '#000000',
    secondary: '#FFFFFF',
    accent: 'from-slate-800/40 to-slate-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    abbrev: 'BKN',
  },
  'New York Knicks': {
    primary: '#006BB6',
    secondary: '#F58426',
    accent: 'from-blue-900/40 to-orange-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    abbrev: 'NYK',
  },
  'Chicago Bulls': {
    primary: '#CE1141',
    secondary: '#000000',
    accent: 'from-red-900/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    abbrev: 'CHI',
  },
  'Cleveland Cavaliers': {
    primary: '#860038',
    secondary: '#FDBB30',
    accent: 'from-red-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    abbrev: 'CLE',
  },
  'Dallas Mavericks': {
    primary: '#00538C',
    secondary: '#002B5E',
    accent: 'from-blue-900/40 to-blue-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    abbrev: 'DAL',
  },
  'Houston Rockets': {
    primary: '#CE1141',
    secondary: '#000000',
    accent: 'from-red-900/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
    abbrev: 'HOU',
  },
  'Los Angeles Clippers': {
    primary: '#C8102E',
    secondary: '#1D428A',
    accent: 'from-red-900/40 to-blue-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    abbrev: 'LAC',
  },
  'Memphis Grizzlies': {
    primary: '#5D76A9',
    secondary: '#12173F',
    accent: 'from-blue-800/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
    abbrev: 'MEM',
  },
  'Minnesota Timberwolves': {
    primary: '#0C2340',
    secondary: '#236192',
    accent: 'from-blue-900/40 to-blue-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    abbrev: 'MIN',
  },
  'New Orleans Pelicans': {
    primary: '#0C2340',
    secondary: '#C8102E',
    accent: 'from-blue-900/40 to-red-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    abbrev: 'NOP',
  },
  'Oklahoma City Thunder': {
    primary: '#007AC1',
    secondary: '#EF3B24',
    accent: 'from-blue-800/40 to-orange-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    abbrev: 'OKC',
  },
  'Orlando Magic': {
    primary: '#0077C0',
    secondary: '#C4CED4',
    accent: 'from-blue-800/40 to-slate-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    abbrev: 'ORL',
  },
  'Portland Trail Blazers': {
    primary: '#E03A3E',
    secondary: '#000000',
    accent: 'from-red-900/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    abbrev: 'POR',
  },
  'Sacramento Kings': {
    primary: '#5A2D81',
    secondary: '#63727A',
    accent: 'from-purple-900/40 to-slate-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    abbrev: 'SAC',
  },
  'San Antonio Spurs': {
    primary: '#C4CED4',
    secondary: '#000000',
    accent: 'from-slate-700/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    abbrev: 'SAS',
  },
  'Toronto Raptors': {
    primary: '#CE1141',
    secondary: '#000000',
    accent: 'from-red-900/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    abbrev: 'TOR',
  },
  'Utah Jazz': {
    primary: '#002B5C',
    secondary: '#00471B',
    accent: 'from-blue-900/40 to-green-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
    abbrev: 'UTA',
  },
  'Washington Wizards': {
    primary: '#002B5C',
    secondary: '#E31837',
    accent: 'from-blue-900/40 to-red-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png',
    abbrev: 'WAS',
  },
  'Atlanta Hawks': {
    primary: '#E03A3E',
    secondary: '#C1D32F',
    accent: 'from-red-900/40 to-lime-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    abbrev: 'ATL',
  },
  'Charlotte Hornets': {
    primary: '#1D1160',
    secondary: '#00788C',
    accent: 'from-purple-900/40 to-teal-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    abbrev: 'CHA',
  },
  'Detroit Pistons': {
    primary: '#C8102E',
    secondary: '#1D42BA',
    accent: 'from-red-900/40 to-blue-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
    abbrev: 'DET',
  },
  'Indiana Pacers': {
    primary: '#002D62',
    secondary: '#FDBB30',
    accent: 'from-blue-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    abbrev: 'IND',
  },
};

// NHL Team data with official colors
export const NHL_TEAMS: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  logo: string;
  abbrev: string;
}> = {
  'Toronto Maple Leafs': {
    primary: '#00205B',
    secondary: '#FFFFFF',
    accent: 'from-blue-900/40 to-blue-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png',
    abbrev: 'TOR',
  },
  'Montreal Canadiens': {
    primary: '#AF1E2D',
    secondary: '#192168',
    accent: 'from-red-900/40 to-blue-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/mtl.png',
    abbrev: 'MTL',
  },
  'Boston Bruins': {
    primary: '#FCB514',
    secondary: '#000000',
    accent: 'from-yellow-700/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png',
    abbrev: 'BOS',
  },
  'New York Rangers': {
    primary: '#0038A8',
    secondary: '#CE1126',
    accent: 'from-blue-900/40 to-red-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png',
    abbrev: 'NYR',
  },
  'Chicago Blackhawks': {
    primary: '#CF0A2C',
    secondary: '#000000',
    accent: 'from-red-900/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    abbrev: 'CHI',
  },
  'Detroit Red Wings': {
    primary: '#CE1126',
    secondary: '#FFFFFF',
    accent: 'from-red-900/40 to-red-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/det.png',
    abbrev: 'DET',
  },
  'Pittsburgh Penguins': {
    primary: '#FCB514',
    secondary: '#000000',
    accent: 'from-yellow-700/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/pit.png',
    abbrev: 'PIT',
  },
  'Philadelphia Flyers': {
    primary: '#F74902',
    secondary: '#000000',
    accent: 'from-orange-800/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/phi.png',
    abbrev: 'PHI',
  },
  'Edmonton Oilers': {
    primary: '#041E42',
    secondary: '#FF4C00',
    accent: 'from-blue-900/40 to-orange-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png',
    abbrev: 'EDM',
  },
  'Vancouver Canucks': {
    primary: '#00205B',
    secondary: '#00843D',
    accent: 'from-blue-900/40 to-green-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/van.png',
    abbrev: 'VAN',
  },
  'Calgary Flames': {
    primary: '#C8102E',
    secondary: '#F1BE48',
    accent: 'from-red-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/cgy.png',
    abbrev: 'CGY',
  },
  'Ottawa Senators': {
    primary: '#C52032',
    secondary: '#C2912C',
    accent: 'from-red-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/ott.png',
    abbrev: 'OTT',
  },
  'Winnipeg Jets': {
    primary: '#041E42',
    secondary: '#004C97',
    accent: 'from-blue-900/40 to-blue-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/wpg.png',
    abbrev: 'WPG',
  },
  'Tampa Bay Lightning': {
    primary: '#002868',
    secondary: '#FFFFFF',
    accent: 'from-blue-900/40 to-blue-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/tb.png',
    abbrev: 'TBL',
  },
  'Florida Panthers': {
    primary: '#041E42',
    secondary: '#C8102E',
    accent: 'from-blue-900/40 to-red-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/fla.png',
    abbrev: 'FLA',
  },
  'Carolina Hurricanes': {
    primary: '#CC0000',
    secondary: '#000000',
    accent: 'from-red-900/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/car.png',
    abbrev: 'CAR',
  },
  'Washington Capitals': {
    primary: '#041E42',
    secondary: '#C8102E',
    accent: 'from-blue-900/40 to-red-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/wsh.png',
    abbrev: 'WSH',
  },
  'New Jersey Devils': {
    primary: '#CE1126',
    secondary: '#000000',
    accent: 'from-red-900/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/njd.png',
    abbrev: 'NJD',
  },
  'New York Islanders': {
    primary: '#00539B',
    secondary: '#F47D30',
    accent: 'from-blue-900/40 to-orange-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/nyi.png',
    abbrev: 'NYI',
  },
  'Columbus Blue Jackets': {
    primary: '#002654',
    secondary: '#CE1126',
    accent: 'from-blue-900/40 to-red-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/cbj.png',
    abbrev: 'CBJ',
  },
  'Buffalo Sabres': {
    primary: '#002654',
    secondary: '#FCB514',
    accent: 'from-blue-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/buf.png',
    abbrev: 'BUF',
  },
  'Colorado Avalanche': {
    primary: '#6F263D',
    secondary: '#236192',
    accent: 'from-red-900/40 to-blue-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png',
    abbrev: 'COL',
  },
  'Dallas Stars': {
    primary: '#006847',
    secondary: '#8F8F8C',
    accent: 'from-green-900/40 to-slate-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/dal.png',
    abbrev: 'DAL',
  },
  'Minnesota Wild': {
    primary: '#154734',
    secondary: '#A6192E',
    accent: 'from-green-900/40 to-red-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/min.png',
    abbrev: 'MIN',
  },
  'Nashville Predators': {
    primary: '#FFB81C',
    secondary: '#041E42',
    accent: 'from-yellow-700/40 to-blue-900/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/nsh.png',
    abbrev: 'NSH',
  },
  'St. Louis Blues': {
    primary: '#002F87',
    secondary: '#FCB514',
    accent: 'from-blue-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/stl.png',
    abbrev: 'STL',
  },
  'Arizona Coyotes': {
    primary: '#8C2633',
    secondary: '#E2D6B5',
    accent: 'from-red-900/40 to-slate-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/ari.png',
    abbrev: 'ARI',
  },
  'Utah Hockey Club': {
    primary: '#69B3E7',
    secondary: '#010101',
    accent: 'from-blue-700/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/utah.png',
    abbrev: 'UTA',
  },
  'Anaheim Ducks': {
    primary: '#F47A38',
    secondary: '#B9975B',
    accent: 'from-orange-800/40 to-yellow-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/ana.png',
    abbrev: 'ANA',
  },
  'Los Angeles Kings': {
    primary: '#111111',
    secondary: '#A2AAAD',
    accent: 'from-slate-800/40 to-slate-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/la.png',
    abbrev: 'LAK',
  },
  'San Jose Sharks': {
    primary: '#006D75',
    secondary: '#000000',
    accent: 'from-teal-900/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/sj.png',
    abbrev: 'SJS',
  },
  'Seattle Kraken': {
    primary: '#001628',
    secondary: '#99D9D9',
    accent: 'from-slate-900/40 to-teal-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/sea.png',
    abbrev: 'SEA',
  },
  'Vegas Golden Knights': {
    primary: '#B4975A',
    secondary: '#333F42',
    accent: 'from-yellow-700/40 to-slate-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/vgk.png',
    abbrev: 'VGK',
  },
};

// NFL Team data
export const NFL_TEAMS: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  logo: string;
  abbrev: string;
}> = {
  'Kansas City Chiefs': {
    primary: '#E31837',
    secondary: '#FFB81C',
    accent: 'from-red-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
    abbrev: 'KC',
  },
  'Philadelphia Eagles': {
    primary: '#004C54',
    secondary: '#A5ACAF',
    accent: 'from-teal-900/40 to-slate-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
    abbrev: 'PHI',
  },
  'San Francisco 49ers': {
    primary: '#AA0000',
    secondary: '#B3995D',
    accent: 'from-red-900/40 to-yellow-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
    abbrev: 'SF',
  },
  'Buffalo Bills': {
    primary: '#00338D',
    secondary: '#C60C30',
    accent: 'from-blue-900/40 to-red-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
    abbrev: 'BUF',
  },
  'Dallas Cowboys': {
    primary: '#003594',
    secondary: '#869397',
    accent: 'from-blue-900/40 to-slate-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
    abbrev: 'DAL',
  },
  'Detroit Lions': {
    primary: '#0076B6',
    secondary: '#B0B7BC',
    accent: 'from-blue-800/40 to-slate-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
    abbrev: 'DET',
  },
  'Baltimore Ravens': {
    primary: '#241773',
    secondary: '#9E7C0C',
    accent: 'from-purple-900/40 to-yellow-700/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
    abbrev: 'BAL',
  },
  'Miami Dolphins': {
    primary: '#008E97',
    secondary: '#FC4C02',
    accent: 'from-teal-800/40 to-orange-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
    abbrev: 'MIA',
  },
  'Green Bay Packers': {
    primary: '#203731',
    secondary: '#FFB612',
    accent: 'from-green-900/40 to-yellow-600/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
    abbrev: 'GB',
  },
  'Cincinnati Bengals': {
    primary: '#FB4F14',
    secondary: '#000000',
    accent: 'from-orange-800/40 to-slate-800/20',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
    abbrev: 'CIN',
  },
};

// Get team data with fallback
export function getNbaTeam(teamName: string) {
  return NBA_TEAMS[teamName] || {
    primary: '#1e293b',
    secondary: '#475569',
    accent: 'from-slate-800/40 to-slate-700/20',
    logo: '',
    abbrev: teamName.split(' ').pop()?.substring(0, 3).toUpperCase() || 'NBA',
  };
}

export function getNhlTeam(teamName: string) {
  return NHL_TEAMS[teamName] || {
    primary: '#1e293b',
    secondary: '#475569',
    accent: 'from-slate-800/40 to-slate-700/20',
    logo: '',
    abbrev: teamName.split(' ').pop()?.substring(0, 3).toUpperCase() || 'NHL',
  };
}

export function getNflTeam(teamName: string) {
  return NFL_TEAMS[teamName] || {
    primary: '#1e293b',
    secondary: '#475569',
    accent: 'from-slate-800/40 to-slate-700/20',
    logo: '',
    abbrev: teamName.split(' ').pop()?.substring(0, 3).toUpperCase() || 'NFL',
  };
}

// Find team by partial match (e.g., "Chiefs" matches "Kansas City Chiefs")
export function findTeamByName(name: string, sport: 'nba' | 'nhl' | 'nfl' = 'nba') {
  const teams = sport === 'nba' ? NBA_TEAMS : sport === 'nhl' ? NHL_TEAMS : NFL_TEAMS;
  const lowerName = name.toLowerCase();
  
  // Exact match first
  if (teams[name]) return { name, ...teams[name] };
  
  // Partial match (team nickname)
  for (const [fullName, data] of Object.entries(teams)) {
    const parts = fullName.toLowerCase().split(' ');
    if (parts.some(p => p === lowerName || lowerName.includes(p) || p.includes(lowerName))) {
      return { name: fullName, ...data };
    }
  }
  
  return null;
}

// Generate player photo URL using ESPN CDN with player IDs
export function getPlayerInitials(playerName: string): string {
  const parts = playerName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return playerName.substring(0, 2).toUpperCase();
}

// ESPN Player IDs for headshots
// URL Pattern: https://a.espncdn.com/i/headshots/{sport}/players/full/{id}.png
// where sport = 'nba', 'nhl', or 'nfl'

export const NBA_PLAYER_IDS: Record<string, string> = {
  // Superstars
  'LeBron James': '1966',
  'Anthony Davis': '6583',
  'Stephen Curry': '3975',
  'Kevin Durant': '3202',
  'Giannis Antetokounmpo': '3032977',
  'Luka Doncic': '3945274',
  'Jayson Tatum': '4065648',
  'Nikola Jokic': '3112335',
  'Joel Embiid': '3059318',
  'Ja Morant': '4279888',
  'Donovan Mitchell': '3908809',
  'Damian Lillard': '6606',
  'Devin Booker': '3136193',
  'Trae Young': '4277905',
  'Zion Williamson': '4395628',
  'Kawhi Leonard': '6450',
  'Paul George': '4251',
  'Jimmy Butler': '6430',
  'Bam Adebayo': '4066261',
  'De\'Aaron Fox': '4066259',
  'Tyrese Haliburton': '4431678',
  'Paolo Banchero': '4706540',
  'Anthony Edwards': '4594268',
  'Shai Gilgeous-Alexander': '4278073',
  'Jalen Brunson': '3934672',
  'Kyrie Irving': '6442',
  'Darius Garland': '4395725',
  'Lauri Markkanen': '4066336',
  'Tyrese Maxey': '4432166',
  'Cade Cunningham': '4432158',
  'Scottie Barnes': '4433134',
  'Victor Wembanyama': '4871484',
  'Austin Reaves': '4397020',
  'D\'Angelo Russell': '3136776',
  'Rui Hachimura': '4065663',
  // Add more as needed
};

export const NHL_PLAYER_IDS: Record<string, string> = {
  // Top NHL Players
  'Connor McDavid': '3895074',
  'Auston Matthews': '4024123',
  'Nathan MacKinnon': '3041969',
  'Leon Draisaitl': '3114727',
  'Cale Makar': '4233884',
  'David Pastrnak': '3899937',
  'Nikita Kucherov': '3042015',
  'Artemi Panarin': '3032080',
  'Mitch Marner': '4024932',
  'Mikko Rantanen': '3899959',
  'Sidney Crosby': '3114',
  'Alex Ovechkin': '3101',
  'Connor Hellebuyck': '3042109',
  'Andrei Vasilevskiy': '3042071',
  'Igor Shesterkin': '4233555',
  'Matthew Tkachuk': '4024858',
  'Brady Tkachuk': '4233557',
  'Elias Pettersson': '4352686',
  'Quinn Hughes': '4353440',
  'Jack Hughes': '4387298',
  'Adam Fox': '4233580',
  'Roman Josi': '2976845',
  'Victor Hedman': '5475',
  'Kirill Kaprizov': '4024128',
  'Jason Robertson': '4564830',
  // Add more as needed
};

export const NFL_PLAYER_IDS: Record<string, string> = {
  // Chiefs
  'Patrick Mahomes': '3139477',
  'Travis Kelce': '15847',
  'Chris Jones': '3051389',
  'Isiah Pacheco': '4360569',
  'Rashee Rice': '4430807',
  'Xavier Worthy': '4866618',
  'JuJu Smith-Schuster': '3916148',
  'Kadarius Toney': '4374302',
  
  // Eagles
  'Jalen Hurts': '4040715',
  'A.J. Brown': '4047646',
  'DeVonta Smith': '4360310',
  'Saquon Barkley': '3929630',
  'Dallas Goedert': '3121022',
  'Lane Johnson': '15974',
  'Jason Kelce': '14109',
  'Darius Slay': '16782',
  
  // 49ers
  'Brock Purdy': '4432577',
  'Christian McCaffrey': '3117251',
  'Deebo Samuel': '4046692',
  'George Kittle': '3040151',
  'Brandon Aiyuk': '4360939',
  'Nick Bosa': '4040612',
  'Fred Warner': '3121399',
  
  // Bills
  'Josh Allen': '3918298',
  'Stefon Diggs': '2977187',
  'James Cook': '4362887',
  
  // Cowboys
  'Dak Prescott': '2577417',
  'CeeDee Lamb': '4361411',
  'Micah Parsons': '4361423',
  
  // Lions
  'Jared Goff': '2977881',
  'Amon-Ra St. Brown': '4362628',
  'Jahmyr Gibbs': '4710882',
  
  // Ravens
  'Lamar Jackson': '3916387',
  'Derrick Henry': '3043078',
  'Mark Andrews': '3121428',
  'Zay Flowers': '4431570',
  
  // Dolphins
  'Tua Tagovailoa': '4241479',
  'Tyreek Hill': '3116406',
  'Jaylen Waddle': '4360294',
  
  // Packers
  'Jordan Love': '4241457',
  'Aaron Jones': '3042519',
  
  // Bengals
  'Joe Burrow': '3915511',
  'Ja\'Marr Chase': '4362628',
  'Tee Higgins': '4240017',
  
  // Add more as needed
};

// Get player headshot URL
export function getPlayerHeadshot(playerName: string, sport: 'nba' | 'nhl' | 'nfl' = 'nba'): string | null {
  const ids = sport === 'nba' ? NBA_PLAYER_IDS : sport === 'nhl' ? NHL_PLAYER_IDS : NFL_PLAYER_IDS;
  const playerId = ids[playerName];
  
  if (!playerId) return null;
  
  return `https://a.espncdn.com/i/headshots/${sport}/players/full/${playerId}.png`;
}

// Common NBA player jersey numbers (known players)
export const NBA_PLAYER_NUMBERS: Record<string, string> = {
  'LeBron James': '23',
  'Anthony Davis': '3',
  'Stephen Curry': '30',
  'Kevin Durant': '35',
  'Giannis Antetokounmpo': '34',
  'Luka Doncic': '77',
  'Jayson Tatum': '0',
  'Nikola Jokic': '15',
  'Joel Embiid': '21',
  'Ja Morant': '12',
  'Donovan Mitchell': '45',
  'Damian Lillard': '0',
  'Devin Booker': '1',
  'Trae Young': '11',
  'Zion Williamson': '1',
  'Kawhi Leonard': '2',
  'Paul George': '13',
  'Jimmy Butler': '22',
  'Bam Adebayo': '13',
  'De\'Aaron Fox': '5',
  'Tyrese Haliburton': '0',
  'Paolo Banchero': '5',
  'Anthony Edwards': '5',
  'Shai Gilgeous-Alexander': '2',
  'Jalen Brunson': '11',
  'Kyrie Irving': '11',
  'Darius Garland': '10',
  'Lauri Markkanen': '23',
  'Tyrese Maxey': '0',
  'Cade Cunningham': '2',
  'Scottie Barnes': '4',
  'Victor Wembanyama': '1',
  'Austin Reaves': '15',
  'D\'Angelo Russell': '1',
  'Rui Hachimura': '28',
};

export function getPlayerNumber(playerName: string): string | null {
  return NBA_PLAYER_NUMBERS[playerName] || null;
}
