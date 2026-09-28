import {StoryEventEntry} from '../../save/StoryEventEntry';

export function mergeStoryEvents(storyEventsA: readonly StoryEventEntry[], storyEventsB: readonly StoryEventEntry[]): StoryEventEntry[] {
  const storyEventsFromBNotInA = storyEventsB.filter(storyEventB =>
    !storyEventsA.some(storyEventA => storyEventA.stringId === storyEventB.stringId)
  );

  return [...storyEventsA, ...storyEventsFromBNotInA];
}
