/**
 * Wire DTO mirroring section 6 of the save format. Field names are the game's, abbreviations
 * included; the domain translates them into business language at its boundary.
 */
export interface MailboxMessage {
  stringId: string;
  isRead: boolean;
}
