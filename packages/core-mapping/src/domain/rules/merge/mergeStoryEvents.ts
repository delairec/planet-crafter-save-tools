import {StoryEvent} from 'shared-save-processing/gameDefinitions';

/**
 * @see @RULE.StoryEventsAreUnioned
 */
export function mergeStoryEvents(storyEventsA: StoryEvent[], storyEventsB: StoryEvent[]): StoryEvent[] {
  const storyEventsFromBNotInA = storyEventsB.filter(storyEventB =>
    !storyEventsA.some(storyEventA => storyEventA.stringId === storyEventB.stringId)
  );

  return [...storyEventsA, ...storyEventsFromBNotInA];
}
