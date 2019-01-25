import { init } from '@airy/maleo/client';

import { routes } from './routes';
import { Wrap } from './_wrap';

init(routes, module, { Wrap });
