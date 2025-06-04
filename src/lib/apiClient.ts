import BaseService from '@/services/BaseService';

const tmdbClient = BaseService.axios(`https://tmdb-a62z.onrender.com/api`);
export default tmdbClient;
