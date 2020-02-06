
import * as _ from 'lodash';

export function parseProjectTags(tags: any) {
  return _.reduce(tags, (result: any, value: any) => {
    if (value.startsWith('contact:')) {
      result.contact = _.replace(value, 'contact:', '').trim();
    } else if (value.startsWith('group:')) {
      result.group = _.replace(value, 'group:', '').trim();
    } else if (value.startsWith('title:')) {
      result.title = _.replace(value, 'title:', '').trim();
    }
    return result;
  }, {});
};

export function extractProjectTags(tags: any) {
  return _.reduce(tags, (result: any, value: any) => {
    if (!value.startsWith('contact:') && !value.startsWith('group:') && !value.startsWith('title:')) {
      result.push(value);
    }
    return result;
  }, []);
};