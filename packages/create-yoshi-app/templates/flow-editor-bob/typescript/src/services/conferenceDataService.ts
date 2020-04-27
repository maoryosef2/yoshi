const CONFERENCER_API_BASE_URL = 'https://apps.wix.com/conferencer-bob/api';

export interface Speaker {
  id: string;
  name: string;
  title: string;
  tags: Array<string>;
  description: string;
  photoUrl: string;
}

export interface Session {
  id: string;
  title: string;
  location: string;
  description: string;
  tags: Array<string>;
  startTime: number;
  endTime: number;
  speaker: string;
}

export function getTags(): Promise<Record<string, string>> {
  return fetch(`${CONFERENCER_API_BASE_URL}/tags`).then(res => res.json());
}

export function getSpeakersList(
  filteredTags: Array<string> = [],
  sort: boolean,
): Promise<Array<Speaker>> {
  let query = '?';

  if (filteredTags && filteredTags.length > 0) {
    query += filteredTags.map(tag => `tags[]=${tag}`).join('&');
  }

  if (sort) {
    query += '&sort=true';
  }

  return fetch(`${CONFERENCER_API_BASE_URL}/speakers${query}`).then(res =>
    res.json(),
  );
}

export function getSessionsBySpeaker(
  speakerId: string,
): Promise<Array<Session>> {
  return fetch(
    `${CONFERENCER_API_BASE_URL}/speakers/${speakerId}/sessions`,
  ).then(res => res.json());
}
