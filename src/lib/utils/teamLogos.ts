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

// MLB team abbreviations (30 teams)
const MLB_TEAMS: Record<string, string> = {
  'Arizona Diamondbacks': 'ari',
  'Atlanta Braves': 'atl',
  'Baltimore Orioles': 'bal',
  'Boston Red Sox': 'bos',
  'Chicago Cubs': 'chc',
  'Chicago White Sox': 'chw',
  'Cincinnati Reds': 'cin',
  'Cleveland Guardians': 'cle',
  'Colorado Rockies': 'col',
  'Detroit Tigers': 'det',
  'Houston Astros': 'hou',
  'Kansas City Royals': 'kc',
  'Los Angeles Angels': 'laa',
  'LA Angels': 'laa',
  'Los Angeles Dodgers': 'lad',
  'LA Dodgers': 'lad',
  'Miami Marlins': 'mia',
  'Milwaukee Brewers': 'mil',
  'Minnesota Twins': 'min',
  'New York Mets': 'nym',
  'New York Yankees': 'nyy',
  'Oakland Athletics': 'oak',
  'Philadelphia Phillies': 'phi',
  'Pittsburgh Pirates': 'pit',
  'San Diego Padres': 'sd',
  'San Francisco Giants': 'sf',
  'Seattle Mariners': 'sea',
  'St. Louis Cardinals': 'stl',
  'Tampa Bay Rays': 'tb',
  'Texas Rangers': 'tex',
  'Toronto Blue Jays': 'tor',
  'Washington Nationals': 'wsh',
};

// NFL team abbreviations (32 teams)
const NFL_TEAMS: Record<string, string> = {
  'Arizona Cardinals': 'ari',
  'Atlanta Falcons': 'atl',
  'Baltimore Ravens': 'bal',
  'Buffalo Bills': 'buf',
  'Carolina Panthers': 'car',
  'Chicago Bears': 'chi',
  'Cincinnati Bengals': 'cin',
  'Cleveland Browns': 'cle',
  'Dallas Cowboys': 'dal',
  'Denver Broncos': 'den',
  'Detroit Lions': 'det',
  'Green Bay Packers': 'gb',
  'Houston Texans': 'hou',
  'Indianapolis Colts': 'ind',
  'Jacksonville Jaguars': 'jax',
  'Kansas City Chiefs': 'kc',
  'Las Vegas Raiders': 'lv',
  'Los Angeles Chargers': 'lac',
  'LA Chargers': 'lac',
  'Los Angeles Rams': 'lar',
  'LA Rams': 'lar',
  'Miami Dolphins': 'mia',
  'Minnesota Vikings': 'min',
  'New England Patriots': 'ne',
  'New Orleans Saints': 'no',
  'New York Giants': 'nyg',
  'New York Jets': 'nyj',
  'Philadelphia Eagles': 'phi',
  'Pittsburgh Steelers': 'pit',
  'San Francisco 49ers': 'sf',
  'Seattle Seahawks': 'sea',
  'Tampa Bay Buccaneers': 'tb',
  'Tennessee Titans': 'ten',
  'Washington Commanders': 'wsh',
};

// EPL team IDs for ESPN soccer logos (different format)
const EPL_TEAMS: Record<string, string> = {
  'Arsenal': '359',
  'Aston Villa': '362',
  'Bournemouth': '349',
  'Brentford': '337',
  'Brighton': '331',
  'Brighton & Hove Albion': '331',
  'Chelsea': '363',
  'Crystal Palace': '384',
  'Everton': '368',
  'Fulham': '370',
  'Ipswich Town': '373',
  'Ipswich': '373',
  'Leicester City': '375',
  'Leicester': '375',
  'Liverpool': '364',
  'Manchester City': '382',
  'Man City': '382',
  'Manchester United': '360',
  'Man United': '360',
  'Newcastle United': '361',
  'Newcastle': '361',
  'Nottingham Forest': '393',
  "Nott'm Forest": '393',
  'Southampton': '376',
  'Tottenham Hotspur': '367',
  'Tottenham': '367',
  'Spurs': '367',
  'West Ham United': '371',
  'West Ham': '371',
  'Wolverhampton': '380',
  'Wolves': '380',
  'Wolverhampton Wanderers': '380',
};

/**
 * Get the ESPN CDN logo URL for a team
 */
export function getTeamLogoUrl(teamName: string, sport: 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL'): string | null {
  // Determine which team map to use
  const teamMaps: Record<string, Record<string, string>> = {
    NHL: NHL_TEAMS,
    NBA: NBA_TEAMS,
    MLB: MLB_TEAMS,
    NFL: NFL_TEAMS,
    EPL: EPL_TEAMS,
  };
  
  const teams = teamMaps[sport];
  if (!teams) return null;
  
  const identifier = teams[teamName];
  
  // Try partial match if no direct match
  let foundId = identifier;
  if (!foundId) {
    const partialMatch = Object.entries(teams).find(([name]) => 
      teamName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(teamName.toLowerCase())
    );
    if (partialMatch) {
      foundId = partialMatch[1];
    }
  }
  
  if (!foundId) return null;
  
  // EPL uses different URL format with team IDs
  if (sport === 'EPL') {
    return `https://a.espncdn.com/i/teamlogos/soccer/500/${foundId}.png`;
  }
  
  // US sports use abbreviation format
  return `https://a.espncdn.com/i/teamlogos/${sport.toLowerCase()}/500/${foundId}.png`;
}

/**
 * Get team abbreviation for display
 */
export function getTeamAbbreviation(teamName: string, sport: 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL'): string {
  const teamMaps: Record<string, Record<string, string>> = {
    NHL: NHL_TEAMS,
    NBA: NBA_TEAMS,
    MLB: MLB_TEAMS,
    NFL: NFL_TEAMS,
    EPL: EPL_TEAMS,
  };
  
  const teams = teamMaps[sport];
  if (!teams) return teamName.split(' ').pop()?.substring(0, 3).toUpperCase() || 'UNK';
  
  const abbr = teams[teamName];
  return abbr?.toUpperCase() || teamName.split(' ').pop()?.substring(0, 3).toUpperCase() || 'UNK';
}
