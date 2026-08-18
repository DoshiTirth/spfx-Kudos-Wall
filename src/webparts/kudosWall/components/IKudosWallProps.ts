import { SPHttpClient } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ICurrentUser {
  displayName: string;
  email: string;
  loginName: string;
}

export interface IKudosWallProps {
  wallTitle: string;
  listName: string;
  showLeaderboard: boolean;
  leaderboardCount: number;
  siteUrl: string;
  spHttpClient: SPHttpClient;
  context: WebPartContext;
  currentUser: ICurrentUser;
}

export interface IKudosItem {
  Id: number;
  Title: string;
  Message: string;
  Category: string;
  GiverName: string;
  ReceiverName: string;
  Reactions: number;
  Created: string;
}

export const CATEGORIES = ['Teamwork', 'Innovation', 'Leadership', 'Above & Beyond'] as const;
export type Category = typeof CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  'Teamwork': '#2f6fed',
  'Innovation': '#12b886',
  'Leadership': '#f59f00',
  'Above & Beyond': '#e64980'
};
