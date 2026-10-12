import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { IsNotBlank } from '../../common/decorators';

export class CreateTicketDto {
  @IsString()
  @IsNotBlank()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsIn(['open', 'in_progress', 'closed'])
  status?: 'open' | 'in_progress' | 'closed';

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';
}
