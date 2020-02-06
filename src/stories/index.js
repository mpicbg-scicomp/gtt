import Vue from 'vue';

import { storiesOf } from '@storybook/vue'; // eslint-disable-line
import { action, configureActions } from '@storybook/addon-actions'; // eslint-disable-line
import { withStorySource } from '@storybook/addon-storysource'; // eslint-disable-line
import { withKnobs, text, number, boolean, array, select, color, date, button } from '@storybook/addon-knobs'; // eslint-disable-line

import MyButton from './Button.vue';
Vue.config.productionTip = false;

storiesOf('Custom|Button/Default', module)
  .addDecorator(withStorySource(`
import Vue from 'vue';

import { storiesOf } from '@storybook/vue';
import { action, configureActions } from '@storybook/addon-actions';
import { withStorySource } from '@storybook/addon-storysource'

import MyButton from './Button.vue';
Vue.config.productionTip = false;

storiesOf('MyButton', module)
.add('with some emoji', () => (
    '<Button>😀 😎 👍 💯</Button>'
))
.add('story as a template', () => '<my-button :rounded="true">story as a function template</my-button>')
.add('story as a component', () => ({
    components: { MyButton },
    template: '<my-button :rounded="true">rounded</my-button>',
}));
    `))
  .add('with some emoji', () => ({
    components: { MyButton },
    template: '<my-button @click="fire">😀 😎 👍 💯</my-button>',
    methods: { fire: action('clicked') },
  }))
  .add('story as a template', () => '<my-button :rounded="true">story as a function template & hongkee</my-button>')
  .add('story as a component', () => ({
    components: { MyButton },
    template: '<my-button :rounded="true">rounded</my-button>',
  }));

storiesOf('Custom|Form/Default', module)
  .addDecorator(withStorySource(`
    .add('with form', () => ({
        components: { MyButton },
        template: '<my-button @click="fire">😀 😎 👍 💯</my-button>',
        methods: { fire: action('clicked') },
    })
    `))
  .add('with form', () => ({
    components: { MyButton },
    template: '<my-button @click="fire">😀 😎 👍 💯</my-button>',
    methods: { fire: action('clicked') },
  }));


storiesOf('Addon|Knobs', module)
  .addDecorator(withKnobs)
  .add('Simple', () => ({
    props: {
      name: {
        type: String,
        default: text('Name', 'John Doe'),
      },
    },

    template: '<div @click="age++">I am {{ name }} and I\'m {{ age }} years old.</div>',

    data() {
      return { age: 40 };
    },

    created() {
      console.log('created');
    },
    destroyed() {
      console.log('destroyed');
    },
  }))
  .add('All knobs', () => {
    const stock = number('Stock', 20, {
      range: true,
      min: 0,
      max: 30,
      step: 5,
    });
    const fruits = {
      Apple: 'apples',
      Banana: 'bananas',
      Cherry: 'cherries',
    };
    const fruit = select('Fruit', fruits, 'apples');
    const price = number('Price', 2.25);

    const colour = color('Border', 'deeppink');
    const today = date('Today', new Date('Jan 20 2017 GMT+0'));
    const items = array('Items', ['Laptop', 'Book', 'Whiskey']);
    const nice = boolean('Nice', true);

    const stockMessage = stock
      ? `I have a stock of ${stock} ${fruit}, costing &dollar;${price} each.`
      : `I'm out of ${fruit}${nice ? ', Sorry!' : '.'}`;
    const salutation = nice ? 'Nice to meet you!' : 'Leave me alone!';
    const dateOptions = {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    };

    button('Arbitrary action', action('You clicked it!'));

    return {
      props: {
        name: {
          type: String,
          default: text('Name', 'Jane'),
        },
      },
      template: `
          <div style="border:2px dotted ${colour}; padding: 8px 22px; border-radius: 8px">
            <h1>My name is {{name}},</h1>
            <h3>today is ${new Date(today).toLocaleDateString('en-US', dateOptions)}</h3>
            <p>${stockMessage}</p>
            <p>Also, I have:</p>
            <ul>
              ${items.map(item => `<li key=${item}>${item}</li>`).join('')}
            </ul>
            <p>${salutation}</p>
          </div>
        `,
    };
  })
  .add('XSS safety', () => ({
    template: `
      <div>
        ${text('Rendered string', '<img src=x onerror="alert(\'XSS Attack\')" >')}
      </div>
    `,
  }));
