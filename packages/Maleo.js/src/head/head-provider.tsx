import React from 'react';

// Hacky way to acquire same context
let HeadManagerContext;
if (typeof window === 'undefined') {
  const { requireRuntime } = require('@utils/require');
  const path = requireRuntime('path');
  HeadManagerContext = requireRuntime(path.resolve(__dirname, './manager-context'));
} else {
  HeadManagerContext = require('./manager-context').default;
}

export interface TagType {
  [key: string]: any;
}

export type State = Array<React.ReactElement<any>> | undefined;
export interface SideEffectProps {
  reduceComponentsToState: <T>(components: Array<React.ReactElement<any>>) => State;
  handleStateChange?: (state: State) => void;
  emitChange: (component: React.Component<SideEffectProps>) => void;
  addMountInstance: (component: React.Component<SideEffectProps>) => void;
  removeMountedInstance: (component: React.Component<SideEffectProps>) => void;
}

export interface HeadProviderState {
  mountedInstances: Set<any>;
  heads: State;
}

const DOMAttributeNames = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv',
};

function reactElementToDOM({ type, props }) {
  const el = document.createElement(type);
  for (const p in props) {
    if (!props.hasOwnProperty(p)) {
      continue;
    }
    if (p === 'children' || p === 'dangerouslySetInnerHTML') {
      continue;
    }

    const attr = DOMAttributeNames[p] || p.toLowerCase();
    el.setAttribute(attr, props[p]);
  }

  const { children, dangerouslySetInnerHTML } = props;
  if (dangerouslySetInnerHTML) {
    el.innerHTML = dangerouslySetInnerHTML.__html || '';
  } else if (children) {
    el.textContent = typeof children === 'string' ? children : children.join('');
  }
  return el;
}

export default function() {
  const mountedInstances = new Set<any>();
  let heads;

  return {
    getHeads: () => {
      const recordedHeads = heads;
      heads = undefined;
      mountedInstances.clear();
      return recordedHeads;
    },
    HeadProvider: class extends React.Component<any, HeadProviderState> {
      updatePromise: Promise<any> | null = null;
      addMountInstance = (component: React.Component<SideEffectProps>) => {
        mountedInstances.add(component);
      };

      removeMountedInstance = (component: React.Component<SideEffectProps>) => {
        mountedInstances.delete(component);
      };

      emitChange = (component: React.Component<SideEffectProps>) => {
        heads = component.props.reduceComponentsToState([...mountedInstances]);
        if (component.props.handleStateChange) {
          component.props.handleStateChange(heads);
        }
      };

      updateHead = (head) => {
        const promise = (this.updatePromise = Promise.resolve().then(() => {
          if (promise !== this.updatePromise) {
            return;
          }

          this.updatePromise = null;
          this.doUpdateHead(head);
        }));
      };

      doUpdateHead(head) {
        const tags: TagType = {};

        head.forEach((h) => {
          const components = tags[h.type] || [];
          components.push(h);
          tags[h.type] = components;
        });

        this.updateTitle(tags.title ? tags.title[0] : null);

        const types = ['meta', 'base', 'link', 'style', 'script'];
        types.forEach((type) => {
          this.updateElements(type, tags[type] || []);
        });
      }

      updateTitle(component) {
        let title: string = '';
        if (component) {
          const { children } = component.props;
          title = typeof children === 'string' ? children : children.join('');
        }
        if (title !== document.title) {
          document.title = title;
        }
      }

      updateElements(type, components) {
        const headEl = document.getElementsByTagName('head')[0];
        const oldTags = Array.prototype.slice.call(headEl.querySelectorAll(type + '.maleo-head'));
        const newTags = components.map(reactElementToDOM).filter((newTag) => {
          for (let i = 0, len = oldTags.length; i < len; i++) {
            const oldTag = oldTags[i];
            if (oldTag.isEqualNode(newTag)) {
              oldTags.splice(i, 1);
              return false;
            }
          }
          return true;
        });

        oldTags.forEach((t) => t.parentNode.removeChild(t));
        newTags.forEach((t) => headEl.appendChild(t));
      }

      render() {
        const { children } = this.props;

        if (__IS_SERVER__) {
          return (
            <HeadManagerContext.Provider
              value={{
                emitChange: this.emitChange,
                addMountInstance: this.addMountInstance,
                removeMountedInstance: this.removeMountedInstance,
              }}>
              {children}
            </HeadManagerContext.Provider>
          );
        }

        return (
          <HeadManagerContext.Provider
            value={{
              updateHead: this.updateHead,

              emitChange: this.emitChange,
              addMountInstance: this.addMountInstance,
              removeMountedInstance: this.removeMountedInstance,
            }}>
            {children}
          </HeadManagerContext.Provider>
        );
      }
    },
  };
}
