// @flow
/* eslint-env browser */

import React, { Component } from 'react';
import { isEqual } from 'lodash';
import styled from 'styled-components';
import { getFixtureViewport } from '../shared';
import { storeViewport } from '../storage';
import { Header } from './Header';
import { stretchStyle, getStyles } from './style';

import type { Node } from 'react';
import type { SetState } from 'react-cosmos-shared2/util';
import type { FixtureState } from 'react-cosmos-shared2/fixtureState';
import type { Storage } from '../../Storage';
import type {
  Viewport,
  ResponsivePreviewConfig,
  ResponsivePreviewState
} from '../shared';

type Props = {
  children: Node,
  config: ResponsivePreviewConfig,
  state: ResponsivePreviewState,
  projectId: string,
  fullScreen: boolean,
  fixtureState: null | FixtureState,
  validFixtureSelected: boolean,
  setState: SetState<ResponsivePreviewState>,
  setFixtureStateViewport: () => void,
  storage: Storage
};

type State = {
  container: null | {
    width: number,
    height: number
  },
  scale: boolean
};

export class ResponsivePreview extends Component<Props, State> {
  state = {
    container: null,
    scale: true
  };

  containerEl: ?HTMLElement;

  render() {
    const {
      children,
      config,
      state,
      fullScreen,
      fixtureState,
      validFixtureSelected
    } = this.props;
    const { container, scale } = this.state;
    const viewport = getViewport(state, fixtureState);

    // We don't simply do `return children` because it would cause a flicker
    // whenever switching between responsive and non responsive mode. By
    // returning the same element nesting between states for Preview the
    // component instances are preserved and the transition is seamless.
    if (!validFixtureSelected || fullScreen || !viewport || !container) {
      return (
        <Container>
          <div key="preview" ref={this.handleContainerRef} style={stretchStyle}>
            <div style={stretchStyle}>
              <div style={stretchStyle}>
                <div style={stretchStyle}>{children}</div>
              </div>
            </div>
          </div>
        </Container>
      );
    }

    const { devices } = config;
    const {
      maskContainerStyle,
      padContainerStyle,
      alignContainerStyle,
      scaleContainerStyle
    } = getStyles({ container, viewport, scale });

    return (
      <Container>
        <Header
          devices={devices}
          viewport={viewport}
          container={container}
          scale={scale}
          createSelectViewportHandler={this.createSelectViewportHandler}
          toggleScale={this.toggleScale}
        />
        <div
          key="preview"
          ref={this.handleContainerRef}
          style={maskContainerStyle}
        >
          <div style={padContainerStyle}>
            <div style={alignContainerStyle}>
              <div style={scaleContainerStyle}>{children}</div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  handleContainerRef = (el: ?HTMLElement) => {
    this.containerEl = el;
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
    this.updateContainerSize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  componentDidUpdate() {
    this.updateContainerSize();
  }

  handleWindowResize = () => {
    this.updateContainerSize();
  };

  createSelectViewportHandler = (viewport: Viewport) => () => {
    const {
      projectId,
      setState,
      setFixtureStateViewport,
      storage
    } = this.props;

    setState({ enabled: true, viewport }, () => {
      setFixtureStateViewport();
      storeViewport(projectId, viewport, storage);
    });
  };

  toggleScale = () => {
    this.setState(({ scale }) => ({ scale: !scale }));
  };

  updateContainerSize() {
    const container = getContainerSize(this.containerEl);

    if (!isEqual(container, this.state.container)) {
      this.setState({
        container
      });
    }
  }
}

function getContainerSize(containerEl: ?HTMLElement) {
  if (!containerEl) {
    return null;
  }

  const { width, height } = containerEl.getBoundingClientRect();

  return { width, height };
}

function getViewport(
  state: ResponsivePreviewState,
  fixtureState: null | FixtureState
): null | Viewport {
  return (
    getFixtureViewport(fixtureState) || (state.enabled ? state.viewport : null)
  );
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: var(--grey6);
`;
