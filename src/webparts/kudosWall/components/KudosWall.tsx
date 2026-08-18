import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  CommandBarButton,
  Dropdown,
  IDropdownOption,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType
} from '@fluentui/react';

import styles from './KudosWall.module.scss';
import { IKudosWallProps, IKudosItem, CATEGORIES } from './IKudosWallProps';
import { fetchKudos, postKudos, incrementReaction } from './KudosDataService';
import KudosCard from './KudosCard';
import Leaderboard from './Leaderboard';
import PostKudosForm from './PostKudosForm';

const categoryFilterOptions: IDropdownOption[] = [
  { key: 'all', text: 'All categories' },
  ...CATEGORIES.map((c) => ({ key: c, text: c }))
];

const KudosWall: React.FC<IKudosWallProps> = (props) => {
  const { listName, wallTitle, showLeaderboard, leaderboardCount } = props;

  const [items, setItems] = useState<IKudosItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const load = async (): Promise<void> => {
    if (!listName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchKudos(props.spHttpClient, props.siteUrl, listName);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load kudos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listName]);

  const filteredItems = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.Category === filter)),
    [items, filter]
  );

  const handleSubmit = async (receiverName: string, category: string, message: string): Promise<void> => {
    await postKudos(props.spHttpClient, props.siteUrl, listName, {
      Title: `${props.currentUser.displayName} → ${receiverName}`,
      Message: message,
      Category: category,
      GiverName: props.currentUser.displayName,
      ReceiverName: receiverName
    });
    await load();
  };

  const handleReact = async (item: IKudosItem): Promise<void> => {
    const newCount = (item.Reactions || 0) + 1;
    setItems((prev) => prev.map((i) => (i.Id === item.Id ? { ...i, Reactions: newCount } : i)));
    try {
      await incrementReaction(props.spHttpClient, props.siteUrl, listName, item.Id, newCount);
    } catch {
      // revert on failure
      setItems((prev) => prev.map((i) => (i.Id === item.Id ? { ...i, Reactions: item.Reactions } : i)));
    }
  };

  if (!listName) {
    return (
      <div className={styles.kudosWall}>
        <MessageBar messageBarType={MessageBarType.info}>
          Set a SharePoint list name in the web part's edit pane to get started.
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.kudosWall}>
      <div className={styles.header}>
        <h2 className={styles.title}>{wallTitle || 'Kudos Wall'}</h2>
        <div className={styles.headerActions}>
          <Dropdown
            className={styles.filterDropdown}
            selectedKey={filter}
            options={categoryFilterOptions}
            onChange={(_e, option) => setFilter(String(option?.key ?? 'all'))}
          />
          <CommandBarButton
            iconProps={{ iconName: 'Heart' }}
            text="Give kudos"
            onClick={() => setFormOpen(true)}
            className={styles.giveButton}
          />
        </div>
      </div>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      <div className={styles.layout}>
        <div className={styles.feed}>
          {loading ? (
            <Spinner size={SpinnerSize.large} label="Loading kudos…" />
          ) : filteredItems.length === 0 ? (
            <MessageBar messageBarType={MessageBarType.warning}>
              No kudos yet — be the first to recognize someone.
            </MessageBar>
          ) : (
            filteredItems.map((item) => (
              <KudosCard key={item.Id} item={item} onReact={handleReact} />
            ))
          )}
        </div>

        {showLeaderboard && (
          <div className={styles.sidebar}>
            <Leaderboard items={items} count={leaderboardCount} />
          </div>
        )}
      </div>

      <PostKudosForm
        isOpen={formOpen}
        onDismiss={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        context={props.context}
      />
    </div>
  );
};

export default KudosWall;
