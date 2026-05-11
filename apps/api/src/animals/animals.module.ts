import { Module } from "@nestjs/common";
import { AnimalsController } from "./animals.controller";
import { AnimalsService } from "./animals.service";

@Module({
  controllers: [AnimalsController],
  providers: [AnimalsService],
  exports: [AnimalsService]
})
export class AnimalsModule {}
