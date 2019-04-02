// tslint:disable:no-console
import fs from 'fs';
import path from 'path';
import { StaticPages } from '@interfaces/build/IWebpackInterfaces';
import { renderStatic } from '@server/render';
import { STATIC_BUILD_DIR } from '@constants/index';

/**
 * acquire corresponding pages which want to be exported as static html
 * render App, Wrap, & Document for each page
 * renderToString & dump it to file
 */
export const buildStatic = async (staticPages: StaticPages, dir: string) => {
  const cwd: string = path.resolve(dir);
  const staticDir: string = path.resolve(cwd, STATIC_BUILD_DIR);
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir);
  }

  Object.keys(staticPages).map(async (p) => {
    // @ts-ignore
    const html = await renderStatic({ req: { originalUrl: p }, res: {} });
    const pageName: string = p.replace(/\/?(\/*)(.+)/, '$2');
    const pathStaticDir = path.resolve(cwd, STATIC_BUILD_DIR, `${pageName}.html`);

    fs.writeFile(pathStaticDir, html, (err) => {
      if (err) {
        console.error(`Error when write static html page ${pageName} to file`);
      } else {
        console.log(`Success create file ${pageName}`);
      }
    });
  });
};
