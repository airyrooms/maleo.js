import React from 'react';
import { MemoryRouter } from 'react-router';
import { shallow } from 'enzyme';

import { Document, Header, Main, Scripts } from '@airy/maleo/document';

describe('<Document />', () => {
  const preloadScripts = [
    { name: 'main', filename: 'main.js' },
    { name: 'common', filename: 'commons.js' },
  ];

  it('renders Header component', () => {
    const context = {
      preloadScripts,
    };
    const header = shallow(<Header />, { context });

    expect(header.context()).toStrictEqual(context);
    expect(header.containsMatchingElement(<link />)).toBe(true);
  });
});
