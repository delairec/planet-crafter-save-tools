import {SaveConfigurationValueObject} from "../valueObjects/SaveConfigurationValueObject";

export type DifficultyModifiers = SaveConfigurationValueObject['modifiers'];

export type DifficultyModifierName = keyof DifficultyModifiers;

export type DifficultyModifierEffect = 'gameDefault' | 'penalisesThePlayer' | 'helpsThePlayer';

export type DifficultyModifierEffects = Record<DifficultyModifierName, DifficultyModifierEffect>;

type PenalisingSide = 'above' | 'below';

const GAME_DEFAULT_MODIFIER = 1;

const penalisingSideByModifier: Record<DifficultyModifierName, PenalisingSide> = {
  terraformationPace: 'below',
  powerConsumption: 'above',
  meteoOccurrence: 'above',
  gaugeDrain: 'above',
  multiplayerFactor: 'above'
};

function assessDifficultyModifier(modifier: number, penalisingSide: PenalisingSide): DifficultyModifierEffect {
  if (modifier === GAME_DEFAULT_MODIFIER) {
    return 'gameDefault';
  }
  const isAboveTheGameDefault = modifier > GAME_DEFAULT_MODIFIER;
  if (isAboveTheGameDefault === (penalisingSide === 'above')) {
    return 'penalisesThePlayer';
  }
  return 'helpsThePlayer';
}

export function assessDifficultyModifiers(modifiers: DifficultyModifiers): DifficultyModifierEffects {
  return {
    terraformationPace: assessDifficultyModifier(modifiers.terraformationPace, penalisingSideByModifier.terraformationPace),
    powerConsumption: assessDifficultyModifier(modifiers.powerConsumption, penalisingSideByModifier.powerConsumption),
    gaugeDrain: assessDifficultyModifier(modifiers.gaugeDrain, penalisingSideByModifier.gaugeDrain),
    meteoOccurrence: assessDifficultyModifier(modifiers.meteoOccurrence, penalisingSideByModifier.meteoOccurrence),
    multiplayerFactor: assessDifficultyModifier(modifiers.multiplayerFactor, penalisingSideByModifier.multiplayerFactor)
  };
}
