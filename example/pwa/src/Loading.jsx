import React from 'react';
import withStyles from '@airy/maleo-css-plugin/withStyles';

import style from './style.css';

export default withStyles(style)(function() {
  return (
    <div className={style.loader}>
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle id={style.spinner} cx="16" cy="16" r="14" fill="none" />
      </svg>
    </div>
  );
});
