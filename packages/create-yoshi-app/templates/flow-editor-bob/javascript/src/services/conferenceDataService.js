const CONFERENCER_API_BASE_URL = 'https://apps.wix.com/conferencer-bob/api';

export function getTags() {
  return fetch(`${CONFERENCER_API_BASE_URL}/tags`).then(res => res.json());
}

export function getSpeakersList(filteredTags = [], sort) {
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

export function getSessionsBySpeaker(speakerId) {
  return fetch(
    `${CONFERENCER_API_BASE_URL}/speakers/${speakerId}/sessions`,
  ).then(res => res.json());
}
