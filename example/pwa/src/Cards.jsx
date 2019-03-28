import React from 'react';
import cn from 'classnames';
import withStyles from '@airy/maleo-css-plugin/withStyles';

import style from './style.css';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Cards({ visibleCards }) {
  const today = new Date().getDay();

  return (
    <main className={style.main}>
      {Object.keys(visibleCards).map((card) => {
        const {
          channel: {
            astronomy: { sunrise, sunset },
            atmosphere: { humidity },
            item: { condition, forecast },
            wind,
          },
          created,
          key,
          label,
        } = visibleCards[card];

        return (
          <div key={created} className={cn(style.card, style.cardTemplate, style.weatherForecast)}>
            <div className={style.cityKey} />
            <div className={style.cardLastUpdated} />
            <div className={style.location} />
            <div className={style.date}>{condition.date}</div>
            <div className={style.description}>{condition.text}</div>
            <div className={style.current}>
              <div className={style.visual}>
                <div className={cn(style.icon, getIconClass(condition.code, style))} />
                <div className={style.temperature}>
                  <span className={style.value}>{Math.round(condition.temp)}</span>
                  <span className={style.scale}>°F</span>
                </div>
              </div>
              <div className={style.description}>
                <div className={style.humidity}>{Math.round(humidity)}%</div>
                <div className={style.wind}>
                  <span className={style.value}>{Math.round(wind.speed)}</span>
                  <span className={style.scale}>mph</span>
                  <span className={style.direction}>{wind.direction}</span>°
                </div>
                <div className={style.sunrise}>{sunrise}</div>
                <div className={style.sunset}>{sunset}</div>
              </div>
            </div>
            <div className={style.future}>
              {forecast.map((fc, i) => (
                <div key={i} className={style.oneday}>
                  <div className={style.date}>{daysOfWeek[(i + today) % 7]}</div>
                  <div className={cn(style.icon, getIconClass(fc.code, style))} />
                  <div className={style.tempHigh}>
                    <span className={style.value}>{Math.round(fc.high)}</span>°
                  </div>
                  <br />
                  <div className={style.tempLow}>
                    <span className={style.value}>{Math.round(fc.low)}</span>°
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </main>
  );
}

function getIconClass(weatherCode, style) {
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
}

export default withStyles(style)(Cards);
