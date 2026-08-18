import * as React from 'react';
import { useState } from 'react';
import {
  Panel,
  PanelType,
  PrimaryButton,
  DefaultButton,
  TextField,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType
} from '@fluentui/react';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import styles from './KudosWall.module.scss';
import { CATEGORIES } from './IKudosWallProps';

export interface IPostKudosFormProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (receiverName: string, category: string, message: string) => Promise<void>;
  context: WebPartContext;
}

const categoryOptions: IDropdownOption[] = CATEGORIES.map((c) => ({ key: c, text: c }));

const PostKudosForm: React.FC<IPostKudosFormProps> = ({ isOpen, onDismiss, onSubmit, context }) => {
  const [receiverName, setReceiverName] = useState<string>('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const reset = (): void => {
    setReceiverName('');
    setCategory(CATEGORIES[0]);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!receiverName || !message.trim()) {
      setError('Pick a person and write a message before posting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(receiverName, category, message.trim());
      reset();
      onDismiss();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post kudos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.smallFixedFar}
      headerText="Give kudos"
      closeButtonAriaLabel="Close"
    >
      <div className={styles.formBody}>
        {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

        <div className={styles.formField}>
          <label className={styles.formLabel}>Who are you recognizing?</label>
          <PeoplePicker
            context={context as unknown as never}
            personSelectionLimit={1}
            principalTypes={[PrincipalType.User]}
            ensureUser={true}
            onChange={(items) => setReceiverName(items[0]?.text || '')}
          />
        </div>

        <div className={styles.formField}>
          <Dropdown
            label="Category"
            selectedKey={category}
            options={categoryOptions}
            onChange={(_e, option) => setCategory(String(option?.key))}
          />
        </div>

        <div className={styles.formField}>
          <TextField
            label="Message"
            multiline
            rows={5}
            value={message}
            onChange={(_e, v) => setMessage(v || '')}
            placeholder="What did they do that deserves a shoutout?"
          />
        </div>

        <div className={styles.formActions}>
          <PrimaryButton text={submitting ? 'Posting…' : 'Post kudos'} onClick={handleSubmit} disabled={submitting} />
          <DefaultButton text="Cancel" onClick={onDismiss} disabled={submitting} />
        </div>
      </div>
    </Panel>
  );
};

export default PostKudosForm;
