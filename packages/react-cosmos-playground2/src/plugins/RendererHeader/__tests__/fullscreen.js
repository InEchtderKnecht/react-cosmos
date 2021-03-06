// @flow

import React from 'react';
import delay from 'delay';
import { render } from 'react-testing-library';
import { Slot, loadPlugins } from 'react-plugin';
import {
  cleanup,
  mockState,
  mockMethod,
  mockPlug
} from '../../../testHelpers/plugin';
import { register } from '..';

afterEach(cleanup);

function registerTestPlugins() {
  register();
  mockState('router', { urlParams: { fixturePath: 'foo', fullScreen: true } });
  mockMethod('rendererCoordinator.isRendererConnected', () => false);
  mockMethod('rendererCoordinator.isValidFixtureSelected', () => true);
}

function loadTestPlugins() {
  loadPlugins();

  return render(<Slot name="rendererHeader" />);
}

it('does not render close button', async () => {
  registerTestPlugins();
  mockPlug({ slotName: 'fixtureActions', render: 'pluggable actions' });
  const { queryByText } = loadTestPlugins();

  // Make sure the element doesn't appear async in the next event loops
  await delay(100);
  expect(queryByText(/close/i)).toBeNull();
});

it('does not render "fixtureActions" slot', async () => {
  registerTestPlugins();
  mockPlug({ slotName: 'fixtureActions', render: 'pluggable actions' });
  const { queryByText } = loadTestPlugins();

  // Make sure the element doesn't appear async in the next event loops
  await delay(100);
  expect(queryByText(/pluggable actions/i)).toBeNull();
});
