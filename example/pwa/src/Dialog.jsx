import React from 'react';
import withStyles from '@airy/maleo-css-plugin/withStyles';

import style from './style.css';

export function Dialog({ toggleAddDialog, addCity, selectedCity, changeSelectedCity, cities }) {
  return (
    <div className={style.dialogContainer}>
      <div className={style.dialog}>
        <div className={style.dialogTitle}>Add new city</div>
        <div className={style.dialogBody}>
          <select
            value={selectedCity}
            onChange={changeSelectedCity}
            onClick={() => console.log('asd')}>
            {cities.map(({ value, city }) => (
              <option key={value} value={value}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div className={style.dialogButtons}>
          <button id={style.butAddCity} className={style.button} onClick={addCity}>
            Add
          </button>
          <button
            id={style.butAddCancel}
            className={style.button}
            onClick={toggleAddDialog.bind(null, false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default withStyles(style)(Dialog);
