import { init } from '@airy/maleo/lib/client/Client';

import { routes } from './routes';
import { Wrap } from './_wrap';

init(routes, module, { Wrap });
