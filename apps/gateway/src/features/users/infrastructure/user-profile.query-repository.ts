import { BaseQueryParams } from '../../../../base/dto/base.query-param';
import { PaginatedViewDto } from '../../../../base/dto/base.paginated.view-dto';
import { PostOutputDto } from '../../posts/api/dto/output/post.output.dto';
import { PrismaService } from '../../../prisma/prisma.service';

export class UserProfileQueryRepository {
  constructor(private prisma: PrismaService) {}

  // async findUserProfile(
  //   id: number,
  //   query: BaseQueryParams,
  //   userId?: number | null,
  // ): Promise<PaginatedViewDto<PostOutputDto[] | null>> {
  //   const findUser = await this.prisma.user.findUnique({
  //     where: { id: id },
  //   });
  //
  //   if (!findUser) return null;
  //   // if (userId === null || userId === undefined) {
  //   if (userId === null) {
  //     query.pageSize = Math.min(query.pageSize || 10, 8);
  //     query.pageNumber = Math.min(query.pageSize, 1);
  //   }
  //   const totalCount = await this.prisma.post.count({
  //     where: { status: 'public', isDeleted: false, userId: id },
  //   });
  //   const posts = await this.prisma.post.findMany({
  //     where: { status: 'public', isDeleted: false, userId: id },
  //     orderBy: { [query.sortBy]: query.sortDirection },
  //     skip: query.calculateSkip(),
  //     take: query.pageSize,
  //     include: {
  //       photos: { where: { isDeleted: false } },
  //     },
  //   });
  //   return PaginatedViewDto.mapToView({
  //     items: posts.map((post) => this.mapToOutput(post)),
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //     totalCount: totalCount,
  //   });
  //   // return posts.map((post) => this.mapToOutput(post));
  // }
}
