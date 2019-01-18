import { init } from '@airy/zones/lib/client/Client';

import { routes } from './routes';
import { Wrap } from './_wrap';

init(routes, module, { Wrap });
