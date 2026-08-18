declare interface IKudosWallWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  WallTitleFieldLabel: string;
  ListNameFieldLabel: string;
  ListNameFieldDescription: string;
  ShowLeaderboardFieldLabel: string;
  LeaderboardCountFieldLabel: string;
}

declare module 'KudosWallWebPartStrings' {
  const strings: IKudosWallWebPartStrings;
  export = strings;
}
