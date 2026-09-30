import {MailboxMessageEntry} from '../../save/MailboxMessageEntry';

export function mergeMailboxes(mailboxA: readonly MailboxMessageEntry[], mailboxB: readonly MailboxMessageEntry[]): MailboxMessageEntry[] {
  const messagesFromBNotInA = mailboxB.filter(messageB =>
    !mailboxA.some(messageA => messageA.stringId === messageB.stringId)
  );

  const deduplicatedMessages = mailboxA.map(messageA => {
    const messageB = mailboxB.find(message => message.stringId === messageA.stringId);
    if (messageB) {
      return {...messageA, isRead: messageA.isRead || messageB.isRead};
    }

    return messageA;
  });

  return [...deduplicatedMessages, ...messagesFromBNotInA];
}
