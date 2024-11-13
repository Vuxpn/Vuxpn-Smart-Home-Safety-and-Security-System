import { Module } from '@nestjs/common';
import { DetectionWarningController } from './detection.controller';
import { DetectionWarningService } from './detection.service';

@Module({
  controllers: [DetectionWarningController],
  providers: [DetectionWarningService],
})
export class DetectionWarningModule {}
