import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Template, TemplateDocument } from './template.schema';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name) private readonly templateModel: Model<TemplateDocument>,
  ) {}

  async create(dto: CreateTemplateDto): Promise<Template> {
    return this.templateModel.create(dto);
  }

  async findByKey(key: string, language: string): Promise<Template | null> {
    return this.templateModel.findOne({ key, language, channel: 'email' }).lean();
  }
}
