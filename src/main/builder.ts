import { Fetcher } from '@/fetchers/types';
import { FullScraperEvents, SingleScraperEvents } from '@/main/events';
import { MetaOutput, getAllEmbedMetaSorted, getAllSourceMetaSorted, getSpecificId } from '@/main/meta';
import { ProviderRunnerOptions, RunOutput, SourceRunOutput, runAllProviders } from '@/main/runner';
import { getProviders } from '@/providers/all';

// TODO meta data input (tmdb id, imdb id, title, release year)
// TODO actually running scrapers

export interface ProviderBuilderOptions {
  // fetcher, every web request gets called through here
  fetcher: Fetcher;

  // proxied fetcher, if the scraper needs to access a CORS proxy. this fetcher will be called instead
  // of the normal fetcher. Defaults to the normal fetcher.
  proxiedFetcher?: Fetcher;
}

export interface ProviderControls {
  // Run all providers one by one. in order of rank (highest first)
  // returns the stream, or null if none found
  runAll(cbs: FullScraperEvents): Promise<RunOutput | null>;

  // Run a source provider
  runSource(id: string, cbs: SingleScraperEvents): Promise<SourceRunOutput>;

  // get meta data about a source or embed.
  getMetadata(id: string): MetaOutput | null;

  // return all sources. sorted by rank (highest first)
  listSources(): MetaOutput[];

  // return all embed scrapers. sorted by rank (highest first)
  listEmbeds(): MetaOutput[];
}

export function makeProviders(ops: ProviderBuilderOptions): ProviderControls {
  const list = getProviders();
  const providerRunnerOps: ProviderRunnerOptions = {
    fetcher: ops.fetcher,
    proxiedFetcher: ops.proxiedFetcher ?? ops.fetcher,
  };

  return {
    runAll(cbs) {
      return runAllProviders(providerRunnerOps, cbs);
    },
    getMetadata(id) {
      return getSpecificId(list, id);
    },
    listSources() {
      return getAllSourceMetaSorted(list);
    },
    listEmbeds() {
      return getAllEmbedMetaSorted(list);
    },
  };
}
