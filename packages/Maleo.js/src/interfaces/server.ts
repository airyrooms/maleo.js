// Custom Server
export interface IOptions {
  port?: number | string;
  assetDir?: string;
  runHandler?: () => any;
}

// Stats
export interface RawStats {
  static: {
    [key: string]: string[];
  };
  dynamic: {
    [key: string]: string[];
  };
  development?: {
    [key: string]: string[];
  };
}

export interface PreloadAssets {
  name: string;
  filename: string;
}
