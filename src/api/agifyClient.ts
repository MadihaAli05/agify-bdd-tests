import axios, { AxiosInstance } from 'axios';
import 'dotenv/config';

const BASE_URL = process.env.AGIFY_BASE_URL || 'https://api.agify.io';
const API_KEY = process.env.AGIFY_API_KEY;

class AgifyClient {
  public baseURL: string;
  private http: AxiosInstance;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.http = axios.create({ baseURL });
  }

  /** Raw GET with a custom query string */
  async getRaw(queryString: string) {
    const url = queryString ? `${this.baseURL}?${queryString}` : `${this.baseURL}`;
    try {
      const res = await this.http.get(url, { validateStatus: () => true });
      return res;
    } catch (err: any) {
      if (err.response) return err.response;
      throw err;
    }
  }

  /** Single name lookup */
  async getSingle(params: { name: string; country_id?: string }) {
    const sp = new URLSearchParams();
    sp.set('name', params.name);
    if (params.country_id) sp.set('country_id', params.country_id);
    if (API_KEY) sp.set('apikey', API_KEY);
    return this.getRaw(sp.toString());
  }

  /** Batch lookup (up to 10 names) */
  async getBatch(names: string[], country_id?: string) {
    const sp = new URLSearchParams();
    for (const n of names) sp.append('name[]', n);
    if (country_id) sp.set('country_id', country_id);
    if (API_KEY) sp.set('apikey', API_KEY);
    return this.getRaw(sp.toString());
  }
}

export const agifyClient = new AgifyClient(BASE_URL);
export type { AgifyClient };