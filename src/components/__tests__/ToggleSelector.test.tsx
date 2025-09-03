import { render, fireEvent } from '@testing-library/react-native';
import ToggleSelector from '../ToggleSelector';
import React from 'react';

describe('ToggleSelector', () => {
  it('renders options and handles change', () => {
    const onChange = jest.fn();
    const { getByText, getAllByText } = render(
      <ToggleSelector
        value="one"
        options={[{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }]}
        onChange={onChange}
      />
    );
    // open the selector first to reveal the options
    fireEvent.press(getAllByText('One')[0]);
    fireEvent.press(getByText('Two'));
    expect(onChange).toHaveBeenCalledWith('two');
  });
});

