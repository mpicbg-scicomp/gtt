
import * as _ from 'lodash';

export function parseProjectTags(tags: any) {
  return _.reduce(tags, (result: any, value: any) => {
    if (value.startsWith('contact:')) {
      result.contact = _.replace(value, 'contact:', '').trim();
    } else if (value.startsWith('group:')) {
      result.group = _.replace(value, 'group:', '').trim();
    } else if (value.startsWith('title:')) {
      result.title = _.replace(value, 'title:', '').trim();
    } else if (value.toLowerCase() === 'internal') {
      result.intOrExt = 'Internal';
    } else if (value.toLowerCase() === 'external') {
      result.intOrExt = 'External';
    } else if (value.startsWith('financial account:')) {
      result.financialAccount = _.replace(value, 'financial account:', '').trim();
    }
    return result;
  }, {});
};

export function extractProjectTags(tags: any) {
  return _.reduce(tags, (result: any, value: any) => {
    if (!value.startsWith('contact:') && !value.startsWith('group:') && !value.startsWith('title:') && !value.startsWith('financial account:') && !value.startsWith('desc:')) {
      result.push(value);
    }
    return result;
  }, []);
};

export function pad(number: any) {
  if (number < 10) {
    return `0${number}`;
  }
  return number;
}