import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request: NextRequest) {
  try {
    const jsonPath = path.join(process.cwd(), 'app', 'demo.json');
    const demoData = await fs.readFile(jsonPath, 'utf-8');
    const raw = JSON.parse(demoData);

    // Extract match info
    const map = raw.mapName || 'Unknown Map';
    const duration = raw.duration || null;
    const date = raw.date || new Date().toISOString();
    const gameModeStr = raw.gameModeStr || '';

    // Extract teams
    const teamA = raw.teamA || { name: 'Team 1', score: 0 };
    const teamB = raw.teamB || { name: 'Team 2', score: 0 };

    // Extract players and assign to teams
    const players = raw.players && typeof raw.players === 'object' ? Object.values(raw.players) : [];
    // Map player fields to expected scoreboard fields
    const mapPlayer = (p: any) => ({
      name: p.name,
      steamId: p.steamId,
      team: p.team?.name || '',
      kills: p.killCount ?? 0,
      deaths: p.deathCount ?? 0,
      assists: p.assistCount ?? 0,
      adr: p.averageDamagePerRound ?? 0,
      kast: p.kast ?? 0,
      hsp: p.headshotPercent ?? 0,
      rating: p.hltvRating2 ?? p.hltvRating ?? 0,
    });
    const teamAPlayers = players.filter((p: any) => p.team?.name === teamA.name).map(mapPlayer);
    const teamBPlayers = players.filter((p: any) => p.team?.name === teamB.name).map(mapPlayer);

    // Extract rounds
    const rounds = Array.isArray(raw.rounds)
      ? raw.rounds.map((r: any, idx: number) => ({
          number: idx + 1,
          winner: r.winnerName || null,
          winType: r.winType || null,
          duration: r.duration || null,
          score: {
            team1: r.teamAScore ?? null,
            team2: r.teamBScore ?? null,
          },
        }))
      : [];

    // Extract economy and chat
    const economy = Array.isArray(raw.playerEconomies) ? raw.playerEconomies : [];
    const chatMessages = Array.isArray(raw.chatMessages) ? raw.chatMessages : [];

    // Compose processedStats for the frontend
    const processedStats = {
      map,
      date,
      duration,
      teams: {
        team1: {
          name: teamA.name,
          score: teamA.score,
          players: teamAPlayers,
        },
        team2: {
          name: teamB.name,
          score: teamB.score,
          players: teamBPlayers,
        },
      },
      rounds,
      economy,
      chatMessages,
      gameModeStr,
    };

    // Log to verify data is being read
    console.log('Top-level keys:', Object.keys(raw));
    console.log('raw.players type:', typeof raw.players, 'length:', Array.isArray(raw.players) ? raw.players.length : 'N/A');
    if (Array.isArray(raw.playerPositions)) {
      console.log('Sample playerPositions:', raw.playerPositions.slice(0, 3));
    } else if (raw.playerPositions && typeof raw.playerPositions === 'object') {
      console.log('Sample playerPositions (object):', Object.values(raw.playerPositions).slice(0, 3));
    }
    console.log('API processedStats sample:', {
      map: processedStats.map,
      team1: processedStats.teams.team1.name,
      team2: processedStats.teams.team2.name,
      playersTeam1: processedStats.teams.team1.players.length,
      playersTeam2: processedStats.teams.team2.players.length,
      rounds: processedStats.rounds.length,
      economy: processedStats.economy.length,
      chatMessages: processedStats.chatMessages.length,
    });
    if (Array.isArray(players) && players.length > 0) {
      console.log('Sample players:', players.slice(0, 3));
    }
    if (processedStats.teams.team1.players.length > 0) {
      console.log('Sample team1 player:', processedStats.teams.team1.players[0]);
    }
    if (processedStats.teams.team2.players.length > 0) {
      console.log('Sample team2 player:', processedStats.teams.team2.players[0]);
    }

    return NextResponse.json(processedStats);
  } catch (error) {
    console.error('Failed to read demo data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to read demo data'
    }, { 
      status: 500 
    });
  }
}