export interface IConfig {
  port: number;
  jwt: {
    accessTime: number;
    accessSecret: string;
  },
  db: {
    clientUrl: string;
  };
}
