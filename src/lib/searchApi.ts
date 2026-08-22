import { Track } from './trackData';

export interface SearchResultItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioUrl: string;
  albumArtUrl: string;
  accentColor: string;
  bpm: number;
  year: string;
  genre: string;
  source: 'web' | 'curated';
}

/**
 * Searches for songs live via global music search API (iTunes / Web Audio Search)
 */
export const searchOnlineSongs = async (query: string): Promise<SearchResultItem[]> => {
  if (!query || query.trim().length === 0) return [];

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodedQuery}&entity=song&limit=25`
    );

    if (!response.ok) {
      throw new Error(`Search API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results
      .filter((item: any) => item.previewUrl && item.trackName)
      .map((item: any, idx: number) => {
        // Upgrade album art resolution from 100x100 to 600x600
        const highResArt = item.artworkUrl100
          ? item.artworkUrl100.replace('100x100bb', '600x600bb')
          : item.artworkUrl60 || '';

        const colors = ['#d4af37', '#ff5733', '#00e5ff', '#a855f7', '#00ff9d', '#ff3b5c'];
        const accentColor = colors[idx % colors.length];

        return {
          id: `search-${item.trackId || idx}-${Date.now()}`,
          title: item.trackName || 'Unknown Title',
          artist: item.artistName || 'Unknown Artist',
          album: item.collectionName || 'Single',
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 180,
          audioUrl: item.previewUrl,
          albumArtUrl: highResArt,
          accentColor,
          bpm: 100 + (idx % 30),
          year: item.releaseDate ? item.releaseDate.substring(0, 4) : '2024',
          genre: item.primaryGenreName || 'Popular',
          source: 'web' as const,
        };
      });
  } catch (err) {
    console.warn('Live song search fetch error:', err);
    return [];
  }
};
