import { IConfig } from "./interfaces/config.interface";

const RADIX = 10;

export default function(): IConfig {
  return {
    port: parseInt(process.env.PORT!, RADIX),
    db: {
      clientUrl: process.env.DATABASE_URL!
    }
  }
}
