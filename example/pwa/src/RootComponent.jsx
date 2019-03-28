import React from 'react';
import withStyles from '@airy/maleo-css-plugin/withStyles';
import Dynamic from '@airy/maleo/dynamic';

import style from './style.css';

const Cards = Dynamic({
  loader: () => import(/* webpackChunkName:"Cards" */ './Cards'),
});

const Dialog = Dynamic({
  loader: () => import(/* webpackChunkName:"Dialog" */ './Dialog'),
});

const Loading = Dynamic({
  loader: () => import(/* webpackChunkName:"Loading" */ './Loading'),
});

const cities = [
  { value: 2357536, city: 'Austin, TX' },
  { value: 2367105, city: 'Boston, MA' },
  { value: 2379574, city: 'Chicago, IL' },
  { value: 2459115, city: 'New York, NY' },
  { value: 2475687, city: 'Portland, OR' },
  { value: 2487956, city: 'San Francisco, CA' },
  { value: 2490383, city: 'Seattle, WA' },
];

@withStyles(style)
export default class RootComponent extends React.Component {
  state = {
    isLoading: true,
    showDialogContainer: false,
    visibleCards: {},
    selectedCities: [],
    selectedCity: cities[0].value,
  };

  componentDidMount() {
    this.getForecast();
  }

  getForecast = async (key, label) => {
    this.setState({ isLoading: true });
    const response = await fetch('/api/forecast');

    // const response = await axios.get(url);
    if (response.status === 200) {
      const { query } = await response.json();

      this.updateForecastCard(query.result);
    }
  };

  updateForecasts = () => {
    console.log('Update Forecast');
  };

  toggleAddDialog = (visible = false) => {
    this.setState({
      showDialogContainer: visible,
    });
  };

  updateForecastCard = (data) => {
    const dataLastUpdated = new Date(data.created);

    const { visibleCards } = this.state;
    if (!visibleCards[data.key]) {
      this.setState({
        visibleCards: {
          ...visibleCards,
          [data.key]: data,
        },
        isLoading: false,
      });
    }
  };

  changeSelectedCity = (e) => {
    this.setState({
      selectedCity: e.target.value,
    });
  };

  addCity = () => {
    const { selectedCity } = this.state;
    const selected = cities.find((c) => c.value === selectedCity);

    this.getForecast(selected.value, selected.city);
    this.toggleAddDialog(false);
  };

  getIconClass = (weatherCode) => {
    weatherCode = parseInt(weatherCode);
    switch (weatherCode) {
      case 25: // cold
      case 32: // sunny
      case 33: // fair (night)
      case 34: // fair (day)
      case 36: // hot
      case 3200: // not available
        return style.clearDay;
      case 0: // tornado
      case 1: // tropical storm
      case 2: // hurricane
      case 6: // mixed rain and sleet
      case 8: // freezing drizzle
      case 9: // drizzle
      case 10: // freezing rain
      case 11: // showers
      case 12: // showers
      case 17: // hail
      case 35: // mixed rain and hail
      case 40: // scattered showers
        return style.rain;
      case 3: // severe thunderstorms
      case 4: // thunderstorms
      case 37: // isolated thunderstorms
      case 38: // scattered thunderstorms
      case 39: // scattered thunderstorms (not a typo)
      case 45: // thundershowers
      case 47: // isolated thundershowers
        return style.thunderstorms;
      case 5: // mixed rain and snow
      case 7: // mixed snow and sleet
      case 13: // snow flurries
      case 14: // light snow showers
      case 16: // snow
      case 18: // sleet
      case 41: // heavy snow
      case 42: // scattered snow showers
      case 43: // heavy snow
      case 46: // snow showers
        return style.snow;
      case 15: // blowing snow
      case 19: // dust
      case 20: // foggy
      case 21: // haze
      case 22: // smoky
        return style.fog;
      case 24: // windy
      case 23: // blustery
        return style.windy;
      case 26: // cloudy
      case 27: // mostly cloudy (night)
      case 28: // mostly cloudy (day)
      case 31: // clear (night)
        return style.cloudy;
      case 29: // partly cloudy (night)
      case 30: // partly cloudy (day)
      case 44: // partly cloudy
        return style.partlyCloudyDay;
      default:
        return '';
    }
  };

  render() {
    const { isLoading, showDialogContainer, visibleCards, selectedCity } = this.state;

    return (
      <div>
        <header className={style.header}>
          <h1 className={style.header__title}>Weather PWA</h1>
          <button
            id={style.butRefresh}
            className={style.headerButton}
            aria-label="Refresh"
            onClick={this.updateForecasts}
          />
          <button
            id={style.butAdd}
            className={style.headerButton}
            aria-label="Add"
            onClick={this.toggleAddDialog.bind(null, true)}
          />
        </header>

        {showDialogContainer && (
          <Dialog
            toggleAddDialog={this.toggleAddDialog}
            addCity={this.addCity}
            selectedCity={selectedCity}
            changeSelectedCity={this.changeSelectedCity}
            cities={cities}
          />
        )}

        {!!Object.keys(visibleCards).length && <Cards visibleCards={visibleCards} />}

        {isLoading && <Loading />}
      </div>
    );
  }
}
