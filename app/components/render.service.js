// TODO: remove this file after react-table module fix this issue in future

/**
 * Every function in this file except patchRender has the exact source code
 * from the react-table module
 *
 * This entire file is a patch for cell and column render methods as the render
 * method of v7.0.0 of react-table module is not working in production version.
 *
 * This file can be removed once the react-table module fix this issue
 */
import React from 'react';

let renderErr = 'Renderer Error ☝️';

function isClassComponent(component) {
  return (
    typeof component === 'function' &&
    !!(() => {
      let proto = Object.getPrototypeOf(component);
      return proto.prototype && proto.prototype.isReactComponent;
    })()
  );
}

function isFunctionComponent(component) {
  return typeof component === 'function';
}

function isExoticComponent(component) {
  return (
    typeof component === 'object' &&
    typeof component.$$typeof === 'symbol' &&
    ['react.memo', 'react.forward_ref'].includes(component.$$typeof.description)
  );
}

function isReactComponent(component) {
  return (
    isClassComponent(component) ||
    isFunctionComponent(component) ||
    isExoticComponent(component)
  );
}

function flexRender(Comp, props) {
  return isReactComponent(Comp) ? <Comp {...props} /> : Comp;
}

function makeRenderer(instance, column, meta = {}) {
  return (type, userProps = {}) => {
    const Comp = typeof type === 'string' ? column[type] : type;

    if (typeof Comp === 'undefined') {
      throw new Error(renderErr);
    }

    return flexRender(Comp, { ...instance, column, ...meta, ...userProps });
  };
}

/**
 *
 * @param {String} renderFor Type of renderer to be created - column | cell
 * @param {Object} tableInstance created by useTable method
 * @param {Object} column table instance column
 * @param {Object} meta needed only for cell render
 * Structure:
 * {row, cell}
 * @param {String | Function | Component} type value to be rendered
 * @param {*} userProps additional props to be sent to the rendered component
 */
// eslint-disable-next-line import/prefer-default-export
export const patchRender = (
  renderFor,
  tableInstance,
  column,
  meta,
  type,
  userProps
) => {
  let renderer;

  if (renderFor === 'column') {
    renderer = makeRenderer(tableInstance, column);
  } else if (renderFor === 'cell') {
    renderer = makeRenderer(tableInstance, column, meta);
  }

  return renderer(type, userProps);
};
