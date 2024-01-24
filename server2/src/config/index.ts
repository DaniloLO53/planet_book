import { IConfig } from "./interfaces/config.interface";

const RADIX = 10;

export default function(): IConfig {
  return {
    port: parseInt(process.env.PORT!, RADIX),
    jwt: {
      accessTime: parseInt(process.env.JWT_ACCESS_TIME!, RADIX),
      accessSecret: process.env.JWT_ACCESS_SECRET!
    },
    db: {
      clientUrl: process.env.DATABASE_URL!
    }
  }
}
