import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IKudosItem } from './IKudosWallProps';

const PAGE_SIZE = 200;

export async function fetchKudos(
  spHttpClient: SPHttpClient,
  siteUrl: string,
  listName: string
): Promise<IKudosItem[]> {
  const encodedList = encodeURIComponent(listName.replace(/'/g, "''"));
  let url =
    `${siteUrl}/_api/web/lists/getbytitle('${encodedList}')/items` +
    `?$select=Id,Title,Message,Category,GiverName,ReceiverName,Reactions,Created` +
    `&$orderby=Created desc&$top=${PAGE_SIZE}`;

  const items: IKudosItem[] = [];

  while (url) {
    const response: SPHttpClientResponse = await spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`SharePoint REST call failed (${response.status}): ${body}`);
    }
    const json = await response.json();
    items.push(...(json.value as IKudosItem[]));
    url = json['odata.nextLink'] || json['@odata.nextLink'] || '';
  }

  return items;
}

export async function postKudos(
  spHttpClient: SPHttpClient,
  siteUrl: string,
  listName: string,
  payload: { Title: string; Message: string; Category: string; GiverName: string; ReceiverName: string }
): Promise<void> {
  const encodedList = encodeURIComponent(listName.replace(/'/g, "''"));

  const digestResponse = await spHttpClient.get(
    `${siteUrl}/_api/contextinfo`,
    SPHttpClient.configurations.v1,
    { method: 'POST' }
  );
  const digestJson = await digestResponse.json();
  const digest = digestJson.FormDigestValue;

  const response = await spHttpClient.post(
    `${siteUrl}/_api/web/lists/getbytitle('${encodedList}')/items`,
    SPHttpClient.configurations.v1,
    {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'X-RequestDigest': digest
      },
      body: JSON.stringify({ ...payload, Reactions: 0 })
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to post kudos (${response.status}): ${body}`);
  }
}

export async function incrementReaction(
  spHttpClient: SPHttpClient,
  siteUrl: string,
  listName: string,
  itemId: number,
  newCount: number
): Promise<void> {
  const encodedList = encodeURIComponent(listName.replace(/'/g, "''"));

  const digestResponse = await spHttpClient.get(
    `${siteUrl}/_api/contextinfo`,
    SPHttpClient.configurations.v1,
    { method: 'POST' }
  );
  const digestJson = await digestResponse.json();
  const digest = digestJson.FormDigestValue;

  const response = await spHttpClient.post(
    `${siteUrl}/_api/web/lists/getbytitle('${encodedList}')/items(${itemId})`,
    SPHttpClient.configurations.v1,
    {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'X-RequestDigest': digest,
        'X-HTTP-Method': 'MERGE',
        'IF-MATCH': '*'
      },
      body: JSON.stringify({ Reactions: newCount })
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to update reaction (${response.status}): ${body}`);
  }
}
