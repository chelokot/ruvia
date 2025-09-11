import React from 'react';
import { View } from 'react-native';
import renderer from 'react-test-renderer';
import LogoTitle from '@/components/LogoTitle';

describe('LogoTitle', () => {
  it('uses compact gap between icon and text', () => {
    const tree = renderer.create(<LogoTitle />).root;
    const view = tree.findByType(View);
    const style = Array.isArray(view.props.style) ? view.props.style.find(s => s && 'gap' in s) : view.props.style;
    expect(style.gap).toBe(2);
  });
});
