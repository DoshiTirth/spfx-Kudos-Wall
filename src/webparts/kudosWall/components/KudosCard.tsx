import * as React from 'react';
import { Persona, PersonaSize } from '@fluentui/react';
import styles from './KudosWall.module.scss';
import { IKudosItem, CATEGORY_COLORS } from './IKudosWallProps';

export interface IKudosCardProps {
  item: IKudosItem;
  onReact: (item: IKudosItem) => void;
}

const KudosCard: React.FC<IKudosCardProps> = ({ item, onReact }) => {
  const color = CATEGORY_COLORS[item.Category] || '#2f6fed';
  const timeAgo = formatRelativeTime(item.Created);

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <Persona text={item.GiverName} size={PersonaSize.size32} />
        <span className={styles.arrow}>→</span>
        <Persona text={item.ReceiverName} size={PersonaSize.size32} />
        <span className={styles.badge} style={{ background: color }}>{item.Category}</span>
      </div>
      <p className={styles.message}>{item.Message}</p>
      <div className={styles.cardFooter}>
        <span className={styles.time}>{timeAgo}</span>
        <button className={styles.reactBtn} onClick={() => onReact(item)}>
          👏 {item.Reactions || 0}
        </button>
      </div>
    </div>
  );
};

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default KudosCard;
