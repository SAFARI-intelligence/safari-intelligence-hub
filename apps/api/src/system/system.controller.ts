import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("system")
export class SystemController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  async health() {
    const database = await this.prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
    return {
      status: "ok",
      database: database.length > 0,
      timestamp: new Date().toISOString()
    };
  }
}
