import * as React from 'react';
import { Persona, PersonaSize } from '@fluentui/react';
import styles from './KudosWall.module.scss';
import { IKudosItem } from './IKudosWallProps';

export interface ILeaderboardProps {
  items: IKudosItem[];
  count: number;
}

const Leaderboard: React.FC<ILeaderboardProps> = ({ items, count }) => {
  const now = new Date();
  const thisMonth = items.filter((item) => {
    const d = new Date(item.Created);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const tally = new Map<string, number>();
  thisMonth.forEach((item) => {
    tally.set(item.ReceiverName, (tally.get(item.ReceiverName) || 0) + 1);
  });

  const ranked = Array.from(tally.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);

  return (
    <div className={styles.leaderboard}>
      <h3 className={styles.leaderboardTitle}>Top recognized this month</h3>
      {ranked.length === 0 ? (
        <div className={styles.leaderboardEmpty}>No kudos yet this month.</div>
      ) : (
        <ol className={styles.leaderboardList}>
          {ranked.map(([name, kudosCount], i) => (
            <li key={name} className={styles.leaderboardRow}>
              <span className={styles.rank}>{i + 1}</span>
              <Persona text={name} size={PersonaSize.size32} />
              <span className={styles.leaderboardCount}>{kudosCount}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;
