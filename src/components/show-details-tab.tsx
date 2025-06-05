import React from 'react';
import { Show } from '@/types'; // Assuming Show type is in @/types
import { getYear } from '@/lib/utils'; // Assuming getYear is in @/lib/utils

interface ShowDetailsTabProps {
  show: Show | null;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  if (!value && typeof value !== 'number') return null;
  return (
    <div className="py-2">
      <dt className="text-sm font-semibold text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200">{value}</dd>
    </div>
  );
};

const ShowDetailsTab: React.FC<ShowDetailsTabProps> = ({ show }) => {
  if (!show) return null;

  const isTvShow = show.media_type === 'tv';

  return (
    <div className="py-6 px-1 text-slate-50">
      <dl className="divide-y divide-slate-700">
        <DetailItem label="Full Overview" value={show.overview} />
        <DetailItem label="Release Date" value={show.release_date ? new Date(show.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : (show.first_air_date ? new Date(show.first_air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-') } />
        <DetailItem label="Original Title" value={show.original_title || show.original_name} />
        <DetailItem label="Original Language" value={show.original_language?.toUpperCase()} />
        {show.spoken_languages && show.spoken_languages.length > 0 && (
          <DetailItem label="Spoken Languages" value={show.spoken_languages.map(lang => lang.english_name || lang.name).join(', ')} />
        )}
        {show.production_companies && show.production_companies.length > 0 && (() => {
          const companies = show.production_companies || []; // Ensure 'companies' is an array
          return (
            <DetailItem label="Production Companies" value={
            companies.map((pc, index) => (
              <span key={pc.id || index} className="inline-block cursor-pointer hover:text-sky-400 transition-colors duration-150">
                {pc.name}
                {index < companies.length - 1 && <span className="mx-1">,</span>}
              </span>
            ))
          } />
          );
        })()}
        {show.production_countries && show.production_countries.length > 0 && (
          <DetailItem label="Production Countries" value={show.production_countries.map(country => country.name).join(', ')} />
        )}
        <DetailItem label="Status" value={show.status} />
        {show.content_rating && <DetailItem label="Content Rating" value={show.content_rating} />}
        {isTvShow && (
          <>
            <DetailItem label="Type" value={show.type} />
            <DetailItem label="Number of Seasons" value={show.number_of_seasons} />
            <DetailItem label="Number of Episodes" value={show.number_of_episodes} />
            <DetailItem label="Last Episode to Air" value={show.last_episode_to_air ? `${show.last_episode_to_air.name} (S${show.last_episode_to_air.season_number}E${show.last_episode_to_air.episode_number}) - ${new Date(show.last_episode_to_air.air_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : '-'} />
            {show.next_episode_to_air && (
              <DetailItem label="Next Episode to Air" value={`${show.next_episode_to_air.name} (S${show.next_episode_to_air.season_number}E${show.next_episode_to_air.episode_number}) - ${new Date(show.next_episode_to_air.air_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`} />
            )}
          </>
        )}
        <DetailItem label="Popularity Score" value={show.popularity?.toFixed(2)} />
        <DetailItem label="Vote Average" value={`${show.vote_average?.toFixed(1)}/10 (from ${show.vote_count} votes)`} />
        {show.homepage && (
          <DetailItem label="Homepage" value={<a href={show.homepage} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline">Visit Homepage</a>} />
        )}
      </dl>
    </div>
  );
};

export default ShowDetailsTab;
