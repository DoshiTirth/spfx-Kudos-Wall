import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneSlider
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'KudosWallWebPartStrings';
import KudosWall from './components/KudosWall';
import { IKudosWallProps } from './components/IKudosWallProps';
import { IKudosWallWebPartProps } from './IKudosWallWebPartProps';

export default class KudosWallWebPart extends BaseClientSideWebPart<IKudosWallWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IKudosWallProps> = React.createElement(
      KudosWall,
      {
        wallTitle: this.properties.wallTitle,
        listName: this.properties.listName,
        showLeaderboard: this.properties.showLeaderboard,
        leaderboardCount: this.properties.leaderboardCount || 5,
        siteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient as unknown as SPHttpClient,
        context: this.context,
        currentUser: {
          displayName: this.context.pageContext.user.displayName,
          email: this.context.pageContext.user.email,
          loginName: this.context.pageContext.user.loginName
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('wallTitle', { label: strings.WallTitleFieldLabel }),
                PropertyPaneTextField('listName', {
                  label: strings.ListNameFieldLabel,
                  description: strings.ListNameFieldDescription
                }),
                PropertyPaneToggle('showLeaderboard', { label: strings.ShowLeaderboardFieldLabel }),
                PropertyPaneSlider('leaderboardCount', {
                  label: strings.LeaderboardCountFieldLabel,
                  min: 3,
                  max: 10,
                  step: 1
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
