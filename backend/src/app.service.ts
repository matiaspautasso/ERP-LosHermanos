import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'ERP Los Hermanos API - Sistema de Gestión';
  }
}
