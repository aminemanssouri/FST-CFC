import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  async create(@Body() dto: CreateTemplateDto) {
    const created = await this.templatesService.create(dto);
    return { id: String((created as any)._id) };
  }

  @Get(':key')
  async getOne(@Param('key') key: string, @Query('lang') lang?: string) {
    const language = lang?.trim() || 'fr';
    const template = await this.templatesService.findByKey(key, language);
    return { template };
  }
}
