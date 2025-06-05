import React, { useEffect, useState } from 'react';
import { Show, MediaType } from '@/types';
import { Icons } from './icons';
import CustomImage from './custom-image';
import { useModalStore } from '@/stores/modal';
import MovieService from '@/services/MovieService'; // To fetch full details of clicked item
import { getYear } from '@/lib/utils'; // For displaying year

interface ShowMoreLikeThisTabProps {
  showId: number;
  mediaType: MediaType.TV | MediaType.MOVIE;
}

const ShowMoreLikeThisTab: React.FC<ShowMoreLikeThisTabProps> = ({ showId, mediaType }) => {
  const [recommendations, setRecommendations] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const modalStore = useModalStore();

  useEffect(() => {
    if (!showId || !mediaType) return;

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/details/recommendations?id=${showId}&type=${mediaType}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch recommendations: ${response.statusText}`);
        }
        const data: Show[] = await response.json();
        setRecommendations(data.filter(rec => rec.poster_path)); // Filter out items without posters
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching recommendations:', err);
      }
      setIsLoading(false);
    };

    fetchRecommendations();
  }, [showId, mediaType]);

  const handleRecommendationClick = async (item: Show) => {
    try {
      // Fetch full details for the clicked recommendation
      // The item from recommendations might not be complete
      const fullShowDetails = await MovieService.findMovieByIdAndType(item.id, item.media_type);
      if (fullShowDetails) {
        modalStore.openModal(fullShowDetails);
      } else {
        console.error('Failed to fetch full details for recommended item:', item.id);
        // Optionally show a user-facing error here
      }
    } catch (clickError) {
      console.error('Error handling recommendation click:', clickError);
      // Optionally show a user-facing error here
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 flex flex-col items-center justify-center text-slate-400">
        <Icons.spinner className="h-8 w-8 animate-spin mb-2" />
        Loading recommendations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 px-4 text-center text-red-400">
        <Icons.alertCircle className="h-8 w-8 mx-auto mb-2" />
        Error loading recommendations: {error}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return <div className="py-10 text-center text-slate-400">No recommendations found.</div>;
  }

  return (
    <div className="py-6 relative"> {/* Added relative for potential absolute positioning inside if needed */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4 px-1">
        {recommendations.slice(0, 10).map((item) => ( // Display up to 10 recommendations
          <div 
            key={item.id} 
            className="bg-slate-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200 group w-full"
            onClick={() => handleRecommendationClick(item)}
          >
            <div className="aspect-[2/3] w-full bg-slate-700">
              {item.poster_path ? (
                <CustomImage
                  src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                  alt={item.title || item.name || 'Recommended item poster'}
                  width={342}
                  height={513}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icons.image className="h-12 w-12 text-slate-500" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-sky-400">
                {item.title || item.name}
              </h4>
              <p className="text-xs text-slate-400">
                {item.media_type === MediaType.MOVIE ? 'Movie' : 'TV Show'} 
                {item.release_date && ` (${getYear(item.release_date)})`}
                {item.first_air_date && ` (${getYear(item.first_air_date)})`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowMoreLikeThisTab;
