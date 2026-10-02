import {describe, expect, it} from 'bun:test';
import {readFile} from 'node:fs/promises';
import {generateScenarioFixtures, resolveScenarioFixturePath, SCENARIO_FIXTURES} from './generate-scenario-fixtures.ts';

describe('generateScenarioFixtures', () => {
  describe('When the fixtures are generated', () => {
    it('should write every fixture into the directory the scenarios read, then print their count', async () => {
      // Arrange
      const printed: string[] = [];

      // Act
      await generateScenarioFixtures(line => printed.push(line));

      // Assert
      const writtenContents = await Promise.all(SCENARIO_FIXTURES.map(({fileName}) => readFile(resolveScenarioFixturePath(fileName), 'utf8')));
      expect(writtenContents).toEqual(SCENARIO_FIXTURES.map(({generateContent}) => generateContent()));
      expect(printed).toEqual(['generate:scenario-fixtures: 6 fixture(s) written to packages/ui-save-manager/e2e/fixtures.']);
    });
  });
});

describe('SCENARIO_FIXTURES', () => {
  describe('When it generates the other player fixture', () => {
    it('should write a host of another name than the baseline player, with an inventory and an equipment of its own', () => {
      // Act
      const content = SCENARIO_FIXTURES.find(({fileName}) => fileName === 'other-player_valid.json')?.generateContent();

      // Assert
      expect(content).toContain('"name":"Sakia"');
      expect(content).toContain('"inventoryId":144,"equipmentId":145');
      expect(content).toContain('"saveDisplayName":"Companion Save"');
    });
  });

  describe('When it generates the Skeo update fixture', () => {
    it('should pause the logistics and place a world object on Skeo, in the format of game 2.102', () => {
      // Act
      const content = SCENARIO_FIXTURES.find(({fileName}) => fileName === 'skeo-update_valid.json')?.generateContent();

      // Assert
      expect(content).toContain('"logisticsPaused":true');
      expect(content).toContain('"planet":-440810600');
      expect(content).toContain('"version":"2.102"');
    });
  });

  describe('When it generates the energy consumption fixture', () => {
    const energyConsumptionFixture = SCENARIO_FIXTURES.find(({fileName}) => fileName === 'energy-consumption_valid.json');

    it('should place TreePlanter3 and the machines drawing no power on Toxicity', () => {
      // Act
      const content = energyConsumptionFixture?.generateContent();

      // Assert
      expect(content).toContain('{"id":41000002,"gId":"TreePlanter3","pos":"1761.865,472.58,-1106.104","rot":"0,0,0,1","planet":110910045}');
      expect(content).toContain('{"id":41000008,"gId":"PodUnderground","pos":"1791.865,472.58,-1106.104","rot":"0,0,0,1","planet":110910045}');
      expect(content).toContain('{"id":41000009,"gId":"RocketAnimals2","pos":"1796.865,472.58,-1106.104","rot":"0,0,0,1","planet":110910045}');
    });

    it('should give the energy fuse to one optimizer and a fuse of another kind to the other', () => {
      // Act
      const content = energyConsumptionFixture?.generateContent();

      // Assert
      expect(content).toContain('{"id":41000010,"gId":"Optimizer1","pos":"1746.865,472.58,-1106.104","rot":"0,0,0,1","planet":110910045,"liId":244}');
      expect(content).toContain('{"id":244,"woIds":"41000101","size":1}');
      expect(content).toContain('{"id":41000101,"gId":"FuseEnergy1"}');
      expect(content).toContain('{"id":41000011,"gId":"Optimizer2","pos":"1741.865,472.58,-1106.104","rot":"0,0,0,1","planet":110910045,"liId":245}');
      expect(content).toContain('{"id":245,"woIds":"41000102","size":3}');
      expect(content).toContain('{"id":41000102,"gId":"FuseProduction1"}');
    });

    it('should write a game 2.103 save whose power consumption modifier leaves the base levels unchanged', () => {
      // Act
      const content = energyConsumptionFixture?.generateContent();

      // Assert
      expect(content).toContain('"modifierPowerConsumption":1,');
      expect(content).toContain('"version":"2.103"');
    });
  });
});
