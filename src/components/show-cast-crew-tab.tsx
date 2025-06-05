import React, { useEffect, useState } from 'react';
import { CreditsResponse, CastMember, CrewMember, MediaType } from '@/types';
import { Icons } from './icons'; // For loading/error icons
import CustomImage from './custom-image'; // Assuming CustomImage can handle external URLs and fallbacks

interface ShowCastCrewTabProps {
  showId: number;
  mediaType: MediaType.TV | MediaType.MOVIE;
}

const KEY_CREW_DEPARTMENTS = ['Directing', 'Writing', 'Production'];
const DISPLAY_CAST_COUNT = 20;

const ShowCastCrewTab: React.FC<ShowCastCrewTabProps> = ({ showId, mediaType }) => {
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllCast, setShowAllCast] = useState<boolean>(false);

  useEffect(() => {
    if (!showId || !mediaType) return;

    const fetchCredits = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/details/credits?id=${showId}&type=${mediaType}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch credits: ${response.statusText}`);
        }
        const data: CreditsResponse = await response.json();
        setCredits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching credits:', err);
      }
      setIsLoading(false);
    };

    fetchCredits();
  }, [showId, mediaType]);

  if (isLoading) {
    return (
      <div className="py-10 flex flex-col items-center justify-center text-slate-400">
        <Icons.spinner className="h-8 w-8 animate-spin mb-2" />
        Loading cast & crew...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 px-4 text-center text-red-400">
        <Icons.alertCircle className="h-8 w-8 mx-auto mb-2" />
        Error loading cast & crew: {error}
      </div>
    );
  }

  if (!credits || (credits.cast.length === 0 && credits.crew.length === 0)) {
    return <div className="py-10 text-center text-slate-400">No cast or crew information available.</div>;
  }

  const sortedCast = credits.cast.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  const displayedCast = showAllCast ? sortedCast : sortedCast.slice(0, DISPLAY_CAST_COUNT);
  const keyCrew = credits.crew.filter(member => 
    KEY_CREW_DEPARTMENTS.includes(member.department || '') || 
    member.job === 'Director' || member.job === 'Screenplay' || member.job === 'Producer'
  ).reduce((acc, member) => { // Group by job to avoid too many similar entries if needed, or just list
    // Simple list for now, can be sophisticated later
    if (!acc.find(m => m.id === member.id && m.job === member.job)) {
        acc.push(member);
    }
    return acc;
  }, [] as CrewMember[]).slice(0, 15); // Limit crew display as well

  return (
    <div className="py-6 px-1 text-slate-50">
      {displayedCast.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-slate-200 mb-4">Cast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedCast.map((member) => (
              <div key={member.credit_id} className="text-center">
                <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-slate-700 mb-2">
                  {member.profile_path ? (
                    <CustomImage 
                      src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                      alt={member.name}
                      width={185}
                      height={278}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icons.user className="h-12 w-12 text-slate-500" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-200 truncate">{member.name}</p>
                {member.character && <p className="text-xs text-slate-400 truncate">as {member.character}</p>}
              </div>
            ))}
          </div>
          {credits.cast.length > DISPLAY_CAST_COUNT && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllCast(!showAllCast)}
                className="px-4 py-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors duration-150 rounded-md bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
              >
                {showAllCast ? 'Show Less' : `Show More (${credits.cast.length - DISPLAY_CAST_COUNT} more)`}
              </button>
            </div>
          )}
        </section>
      )}

      {keyCrew.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-slate-200 mb-4">Crew</h3>
          <ul className="space-y-2">
            {keyCrew.map((member) => (
              <li key={member.credit_id} className="text-sm">
                <span className="font-medium text-slate-300">{member.name}</span>
                <span className="text-slate-400"> - {member.job} ({member.department})</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ShowCastCrewTab;
