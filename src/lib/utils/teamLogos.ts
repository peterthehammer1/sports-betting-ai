/**
 * Team logo utilities using ESPN CDN
 * Static mappings - no API calls required
 */

// NHL team abbreviations (32 teams)
const NHL_TEAMS: Record<string, string> = {
  'Anaheim Ducks': 'ana',
  'Arizona Coyotes': 'ari',
  'Boston Bruins': 'bos',
  'Buffalo Sabres': 'buf',
  'Calgary Flames': 'cgy',
  'Carolina Hurricanes': 'car',
  'Chicago Blackhawks': 'chi',
  'Colorado Avalanche': 'col',
  'Columbus Blue Jackets': 'cbj',
  'Dallas Stars': 'dal',
  'Detroit Red Wings': 'det',
  'Edmonton Oilers': 'edm',
  'Florida Panthers': 'fla',
  'Los Angeles Kings': 'la',
  'Minnesota Wild': 'min',
  'Montréal Canadiens': 'mtl',
  'Montreal Canadiens': 'mtl',
  'Nashville Predators': 'nsh',
  'New Jersey Devils': 'njd',
  'New York Islanders': 'nyi',
  'New York Rangers': 'nyr',
  'Ottawa Senators': 'ott',
  'Philadelphia Flyers': 'phi',
  'Pittsburgh Penguins': 'pit',
  'San Jose Sharks': 'sj',
  'Seattle Kraken': 'sea',
  'St. Louis Blues': 'stl',
  'St Louis Blues': 'stl',
  'Tampa Bay Lightning': 'tb',
  'Toronto Maple Leafs': 'tor',
  'Utah Hockey Club': 'utah',
  'Utah Mammoth': 'utah',
  'Vancouver Canucks': 'van',
  'Vegas Golden Knights': 'vgk',
  'Washington Capitals': 'wsh',
  'Winnipeg Jets': 'wpg',
};

// NBA team abbreviations (30 teams)
const NBA_TEAMS: Record<string, string> = {
  'Atlanta Hawks': 'atl',
  'Boston Celtics': 'bos',
  'Brooklyn Nets': 'bkn',
  'Charlotte Hornets': 'cha',
  'Chicago Bulls': 'chi',
  'Cleveland Cavaliers': 'cle',
  'Dallas Mavericks': 'dal',
  'Denver Nuggets': 'den',
  'Detroit Pistons': 'det',
  'Golden State Warriors': 'gs',
  'Houston Rockets': 'hou',
  'Indiana Pacers': 'ind',
  'Los Angeles Clippers': 'lac',
  'LA Clippers': 'lac',
  'Los Angeles Lakers': 'lal',
  'LA Lakers': 'lal',
  'Memphis Grizzlies': 'mem',
  'Miami Heat': 'mia',
  'Milwaukee Bucks': 'mil',
  'Minnesota Timberwolves': 'min',
  'New Orleans Pelicans': 'no',
  'New York Knicks': 'ny',
  'Oklahoma City Thunder': 'okc',
  'Orlando Magic': 'orl',
  'Philadelphia 76ers': 'phi',
  'Phoenix Suns': 'phx',
  'Portland Trail Blazers': 'por',
  'Sacramento Kings': 'sac',
  'San Antonio Spurs': 'sa',
  'Toronto Raptors': 'tor',
  'Utah Jazz': 'utah',
  'Washington Wizards': 'wsh',
};

/**
 * Get the ESPN CDN logo URL for a team
 */
export function getTeamLogoUrl(teamName: string, sport: 'NHL' | 'NBA'): string | null {
  const teams = sport === 'NHL' ? NHL_TEAMS : NBA_TEAMS;
  const abbr = teams[teamName];
  
  if (!abbr) {
    // Try partial match
    const partialMatch = Object.entries(teams).find(([name]) => 
      teamName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(teamName.toLowerCase())
    );
    if (partialMatch) {
      return `https://a.espncdn.com/i/teamlogos/${sport.toLowerCase()}/500/${partialMatch[1]}.png`;
    }
    return null;
  }
  
  return `https://a.espncdn.com/i/teamlogos/${sport.toLowerCase()}/500/${abbr}.png`;
}

/**
 * Get team abbreviation for display
 */
export function getTeamAbbreviation(teamName: string, sport: 'NHL' | 'NBA'): string {
  const teams = sport === 'NHL' ? NHL_TEAMS : NBA_TEAMS;
  const abbr = teams[teamName];
  return abbr?.toUpperCase() || teamName.split(' ').pop()?.substring(0, 3).toUpperCase() || 'UNK';
}
