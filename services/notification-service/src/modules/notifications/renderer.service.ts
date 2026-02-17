import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';

@Injectable()
export class RendererService {
  render(template: string, payload: Record<string, unknown>): string {
    const compiled = Handlebars.compile(template, { noEscape: true });
    return compiled(payload);
  }
}
