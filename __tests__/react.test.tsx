import React from 'react';
import { describe, it, expect, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { FlagManager } from '../src/manager.js';
import {
  GoodchildProvider,
  Guard,
  useFlag,
  useGoodchild,
} from '../src/react.js';

describe('Goodchild React Bindings', () => {
  const manager = new FlagManager([
    { id: 'foo', enabled: true },
    { id: 'bar', enabled: false },
    { id: 'pro-feature', enabled: true, rules: [{ tiers: ['pro'] }] },
  ]);

  it('should render children when flag is enabled', () => {
    const html = renderToStaticMarkup(
      <GoodchildProvider manager={manager}>
        <Guard flag="foo">
          <div>Foo Content</div>
        </Guard>
      </GoodchildProvider>
    );

    expect(html).toContain('<div>Foo Content</div>');
  });

  it('should not render children when flag is disabled', () => {
    const html = renderToStaticMarkup(
      <GoodchildProvider manager={manager}>
        <Guard flag="bar">
          <div>Bar Content</div>
        </Guard>
      </GoodchildProvider>
    );

    expect(html).toBe('');
  });

  it('should render fallback when flag is disabled', () => {
    const html = renderToStaticMarkup(
      <GoodchildProvider manager={manager}>
        <Guard flag="bar" fallback={<span>Fallback</span>}>
          <div>Bar Content</div>
        </Guard>
      </GoodchildProvider>
    );

    expect(html).toBe('<span>Fallback</span>');
    expect(html).not.toContain('Bar Content');
  });

  it('should pass context down to manager for evaluation', () => {
    const html = renderToStaticMarkup(
      <GoodchildProvider manager={manager} context={{ tier: 'pro' }}>
        <Guard flag="pro-feature">
          <div>Pro User!</div>
        </Guard>
      </GoodchildProvider>
    );

    expect(html).toContain('<div>Pro User!</div>');
  });

  it('should fail context evaluation if tier is wrong', () => {
    const html = renderToStaticMarkup(
      <GoodchildProvider manager={manager} context={{ tier: 'free' }}>
        <Guard flag="pro-feature">
          <div>Pro User!</div>
        </Guard>
      </GoodchildProvider>
    );

    expect(html).toBe('');
  });

  it('hook should return defaultValue if used outside of provider', () => {
    const TestComponent = () => {
      const isEnabled = useFlag('foo', true);
      return <div>{isEnabled ? 'yes' : 'no'}</div>;
    };

    const html = renderToStaticMarkup(<TestComponent />);
    expect(html).toBe('<div>yes</div>');
  });

  it('useGoodchild should throw if used outside of provider', () => {
    const TestComponent = () => {
      let error = null;
      try {
        const { manager } = useGoodchild();
      } catch (e: any) {
        error = e;
      }
      return <div>{error ? error.message : 'ok'}</div>;
    };

    const html = renderToStaticMarkup(<TestComponent />);
    expect(html).toBe(
      '<div>useGoodchild must be used within a GoodchildProvider.</div>'
    );
  });
});
