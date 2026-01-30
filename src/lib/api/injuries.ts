/**
 * Injury Data Service
 * Fetches injury data from ESPN's public API
 */

import type {
  PlayerInjury,
  TeamInjuries,
  SportInjuries,
  InjuryStatus,
  InjurySeverity,
  ESPNInjuryResponse,
  ESPNPlayerInjury,
} from '@/types/injuries';

// ESPN API endpoints for injuries
const ESPN_INJURY_URLS = {
  NBA: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries',
  NHL: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/injuries',
  NFL: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/injuries',
};

// Key players by position that significantly impact games
const KEY_POSITIONS: Record<string, string[]> = {
  NBA: ['PG', 'SG', 'SF', 'PF', 'C'], // All starters matter in NBA
  NHL: ['C', 'G', 'LW', 'RW', 'D'], // Centers, goalies, top defensemen
  NFL: ['QB', 'RB', 'WR', 'TE', 'LT', 'RT', 'CB', 'DE', 'LB'], // Skill positions + key defenders
};

// Map ESPN status to our normalized status
function normalizeStatus(espnStatus: string): InjuryStatus {
  const statusLower = espnStatus.toLowerCase();
  
  if (statusLower.includes('out') || statusLower === 'o') return 'Out';
  if (statusLower.includes('doubtful') || statusLower === 'd') return 'Doubtful';
  if (statusLower.includes('questionable') || statusLower === 'q') return 'Questionable';
  if (statusLower.includes('probable') || statusLower === 'p') return 'Probable';
  if (statusLower.includes('day-to-day') || statusLower.includes('dtd')) return 'Day-To-Day';
  if (statusLower.includes('ir') || statusLower.includes('injured reserve')) return 'Injured Reserve';
  if (statusLower.includes('suspend')) return 'Suspension';
  
  return 'Unknown';
}

// Determine severity based on status and position
function determineSeverity(status: InjuryStatus, position: string, sport: string): InjurySeverity {
  const isKeyPosition = KEY_POSITIONS[sport]?.slice(0, 5).includes(position.toUpperCase());
  
  // High severity: key player definitely out
  if ((status === 'Out' || status === 'Injured Reserve') && isKeyPosition) {
    return 'high';
  }
  
  // High severity for any quarterback or goalie
  if ((position.toUpperCase() === 'QB' || position.toUpperCase() === 'G') && 
      (status === 'Out' || status === 'Doubtful' || status === 'Injured Reserve')) {
    return 'high';
  }
  
  // Medium severity: key player questionable or any player definitely out
  if (status === 'Out' || status === 'Injured Reserve' || 
      (isKeyPosition && (status === 'Doubtful' || status === 'Questionable'))) {
    return 'medium';
  }
  
  return 'low';
}

// Transform ESPN injury data to our format
function transformESPNInjury(
  injury: ESPNPlayerInjury,
  teamName: string,
  teamAbbrev: string,
  sport: string
): PlayerInjury {
  const status = normalizeStatus(injury.status || injury.type?.abbreviation || 'Unknown');
  const position = injury.athlete?.position?.abbreviation || 'Unknown';
  
  return {
    id: injury.id || `${injury.athlete?.id}-${Date.now()}`,
    playerName: injury.athlete?.displayName || 'Unknown Player',
    playerId: injury.athlete?.id,
    position,
    team: teamName,
    teamAbbrev,
    status,
    injuryType: injury.details?.type || injury.type?.description || 'Undisclosed',
    details: injury.details?.detail || injury.details?.fantasyStatus?.description,
    returnDate: injury.details?.returnDate,
    severity: determineSeverity(status, position, sport),
    lastUpdate: injury.date || new Date().toISOString(),
  };
}

// Fetch injuries for a specific sport
export async function fetchInjuries(sport: 'NBA' | 'NHL' | 'NFL'): Promise<SportInjuries> {
  const url = ESPN_INJURY_URLS[sport];
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`ESPN API returned ${response.status}`);
    }

    const data = await response.json();
    
    // ESPN returns injuries grouped by team at top level
    // Structure: { injuries: [{ id, displayName, injuries: [...] }] }
    const teamsData = data.injuries || [];
    
    const teams: TeamInjuries[] = teamsData.map((teamData: { 
      id?: string; 
      displayName?: string; 
      injuries?: ESPNPlayerInjury[] 
    }) => {
      // Get team name from top-level displayName (NOT from nested team object)
      const teamName = teamData.displayName || 'Unknown Team';
      // Get abbreviation from the first injury's athlete.team if available
      const firstInjury = teamData.injuries?.[0];
      const teamAbbrev = firstInjury?.athlete?.team?.abbreviation || 
        teamName.split(' ').pop()?.substring(0, 3).toUpperCase() || 'UNK';
      
      const injuries = (teamData.injuries || []).map((injury) =>
        transformESPNInjury(injury, teamName, teamAbbrev, sport)
      );

      // Count key players out (high severity injuries)
      const keyPlayersOut = injuries.filter(
        (i) => i.severity === 'high' && (i.status === 'Out' || i.status === 'Injured Reserve')
      ).length;

      return {
        teamName,
        teamAbbrev,
        teamId: teamData.id,
        injuries,
        keyPlayersOut,
      };
    });

    // Sort teams by number of injuries (most first)
    teams.sort((a, b) => b.injuries.length - a.injuries.length);

    const totalInjuries = teams.reduce((sum, team) => sum + team.injuries.length, 0);

    return {
      sport,
      lastUpdated: new Date().toISOString(),
      teams,
      totalInjuries,
    };
  } catch (error) {
    console.error(`Error fetching ${sport} injuries:`, error);
    
    // Return empty data on error
    return {
      sport,
      lastUpdated: new Date().toISOString(),
      teams: [],
      totalInjuries: 0,
    };
  }
}

// Get injuries for specific teams (useful for game-specific queries)
export function getTeamInjuries(
  allInjuries: SportInjuries,
  teamName: string
): TeamInjuries | null {
  // Try to match by full name or abbreviation
  const team = allInjuries.teams.find(
    (t) =>
      t.teamName.toLowerCase().includes(teamName.toLowerCase()) ||
      t.teamAbbrev.toLowerCase() === teamName.toLowerCase() ||
      teamName.toLowerCase().includes(t.teamName.split(' ').pop()?.toLowerCase() || '')
  );
  
  return team || null;
}

// Get injuries affecting a specific game
export function getGameInjuries(
  allInjuries: SportInjuries,
  homeTeam: string,
  awayTeam: string
): { home: TeamInjuries | null; away: TeamInjuries | null; impactLevel: 'high' | 'medium' | 'low' | 'none' } {
  const home = getTeamInjuries(allInjuries, homeTeam);
  const away = getTeamInjuries(allInjuries, awayTeam);
  
  // Determine overall impact level
  const homeHighSeverity = home?.injuries.filter((i) => i.severity === 'high').length || 0;
  const awayHighSeverity = away?.injuries.filter((i) => i.severity === 'high').length || 0;
  const totalHighSeverity = homeHighSeverity + awayHighSeverity;
  
  let impactLevel: 'high' | 'medium' | 'low' | 'none' = 'none';
  if (totalHighSeverity >= 2) impactLevel = 'high';
  else if (totalHighSeverity === 1) impactLevel = 'medium';
  else if ((home?.injuries.length || 0) + (away?.injuries.length || 0) > 0) impactLevel = 'low';
  
  return { home, away, impactLevel };
}

// Format injuries for AI analysis prompt
export function formatInjuriesForAI(
  homeTeam: string,
  awayTeam: string,
  homeInjuries: TeamInjuries | null,
  awayInjuries: TeamInjuries | null
): string {
  const lines: string[] = ['INJURY REPORT:'];
  
  if (!homeInjuries?.injuries.length && !awayInjuries?.injuries.length) {
    return 'INJURY REPORT: No significant injuries reported for either team.';
  }
  
  // Format away team injuries
  if (awayInjuries?.injuries.length) {
    lines.push(`\n${awayTeam}:`);
    // Sort by severity (high first)
    const sorted = [...awayInjuries.injuries].sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    for (const injury of sorted.slice(0, 8)) { // Limit to 8 most important
      const statusEmoji = injury.status === 'Out' || injury.status === 'Injured Reserve' ? '❌' :
                          injury.status === 'Doubtful' ? '🔴' :
                          injury.status === 'Questionable' ? '🟡' : '🟢';
      lines.push(`  ${statusEmoji} ${injury.playerName} (${injury.position}) - ${injury.status} (${injury.injuryType})`);
    }
    if (awayInjuries.injuries.length > 8) {
      lines.push(`  ... and ${awayInjuries.injuries.length - 8} more`);
    }
  } else {
    lines.push(`\n${awayTeam}: No injuries reported`);
  }
  
  // Format home team injuries
  if (homeInjuries?.injuries.length) {
    lines.push(`\n${homeTeam}:`);
    const sorted = [...homeInjuries.injuries].sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    for (const injury of sorted.slice(0, 8)) {
      const statusEmoji = injury.status === 'Out' || injury.status === 'Injured Reserve' ? '❌' :
                          injury.status === 'Doubtful' ? '🔴' :
                          injury.status === 'Questionable' ? '🟡' : '🟢';
      lines.push(`  ${statusEmoji} ${injury.playerName} (${injury.position}) - ${injury.status} (${injury.injuryType})`);
    }
    if (homeInjuries.injuries.length > 8) {
      lines.push(`  ... and ${homeInjuries.injuries.length - 8} more`);
    }
  } else {
    lines.push(`\n${homeTeam}: No injuries reported`);
  }
  
  return lines.join('\n');
}
