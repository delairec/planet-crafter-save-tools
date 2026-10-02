import {describe, expect, it} from 'bun:test';
import {parseGroupList, serializeGroupList} from './groupList.js';

/** @type {{situation: string, groupList: string, expected: string[]}[]} */
const PARSED_GROUP_LISTS = [
  {situation: 'several groups', groupList: 'BootsSpeed1,Heater2', expected: ['BootsSpeed1', 'Heater2']},
  {situation: 'one group', groupList: 'BootsSpeed1', expected: ['BootsSpeed1']},
  {situation: 'no group', groupList: '', expected: []}
];

describe('Group list', () => {
  describe('When parsing', () => {
    it.each(PARSED_GROUP_LISTS)('should read $situation', ({groupList, expected}) => {
      // Act
      const groups = parseGroupList(groupList);

      // Assert
      expect(groups).toEqual(expected);
    });
  });

  describe('When serializing', () => {
    it.each([
      {situation: 'several groups', groups: ['BootsSpeed1', 'Heater2'], expected: 'BootsSpeed1,Heater2'},
      {situation: 'no group', groups: [], expected: ''}
    ])('should write $situation', ({groups, expected}) => {
      // Act
      const groupList = serializeGroupList(groups);

      // Assert
      expect(groupList).toBe(expected);
    });
  });
});
