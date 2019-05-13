import { InitialProps } from './render';

export interface ExtraProps {
  // @ts-ignore
  location?: Location<any> | null;
  initialData?: InitialProps['data'];
}
