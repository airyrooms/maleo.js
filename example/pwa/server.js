import { Server } from '@airy/maleo/server';
import path from 'path';
import express from 'express';

const PORT = process.env.PORT || 3000;

const maleoServer = Server.init({
  port: PORT,
});

// register static image folder
maleoServer.applyExpressMiddleware('/images', express.static('./images'));
// register path /sw to return service worker file
maleoServer.applyExpressMiddleware('/sw', (req, res, next) => {
  res.sendFile(path.resolve('.', 'sw.js'));
});
maleoServer.applyExpressMiddleware('/manifest.json', (req, res, next) => {
  res.sendFile(path.resolve('.', 'manifest.json'));
});
maleoServer.faviconHandler = (req, res) => {
  res.sendFile(path.resolve('.', 'images', 'icons', 'icon-32x32.png'));
};

// example for client fetching data
maleoServer.applyExpressMiddleware('/api/forecast', (req, res) => {
  setTimeout(() => {
    res.send({
      query: {
        created: Date.parse(new Date()),
        result: {
          key: '2459115',
          label: 'New York, NY',
          created: '2016-07-22T01:00:00Z',
          channel: {
            astronomy: {
              sunrise: '5:43 am',
              sunset: '8:21 pm',
            },
            item: {
              condition: {
                text: 'Windy',
                date: 'Thu, 21 Jul 2016 09:00 PM EDT',
                temp: 56,
                code: 24,
              },
              forecast: [
                { code: 44, high: 86, low: 70 },
                { code: 44, high: 94, low: 73 },
                { code: 4, high: 95, low: 78 },
                { code: 24, high: 75, low: 89 },
                { code: 24, high: 89, low: 77 },
                { code: 44, high: 92, low: 79 },
                { code: 44, high: 89, low: 77 },
              ],
            },
            atmosphere: {
              humidity: 56,
            },
            wind: {
              speed: 25,
              direction: 195,
            },
          },
        },
      },
    });
  }, 2000);
});

maleoServer.run(() => {
  console.log('Custom Server running on port:', PORT);
});
