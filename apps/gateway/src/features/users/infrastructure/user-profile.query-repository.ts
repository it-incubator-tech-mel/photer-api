import { BasePaginatedOutputDto } from '../../../../base/dto/base-output-dto/base-paginated.output.dto';
import { PrismaService } from '../../../prisma/prisma.service';

export class UserProfileQueryRepository {
  constructor(private prisma: PrismaService) {}

  // async findUserProfile(
  //   id: number,
  //   base-input-query-params: BaseQueryParams,
  //   userId?: number | null,
  // ): Promise<PaginatedViewDto<PostOutputDto[] | null>> {
  //   const findUser = await this.prisma.user.findUnique({
  //     where: { id: id },
  //   });
  //
  //   if (!findUser) return null;
  //   // if (userId === null || userId === undefined) {
  //   if (userId === null) {
  //     base-input-query-params.pageSize = Math.min(base-input-query-params.pageSize || 10, 8);
  //     base-input-query-params.pageNumber = Math.min(base-input-query-params.pageSize, 1);
  //   }
  //   const totalCount = await this.prisma.post.count({
  //     where: { status: 'public', isDeleted: false, userId: id },
  //   });
  //   const post = await this.prisma.post.findMany({
  //     where: { status: 'public', isDeleted: false, userId: id },
  //     orderBy: { [base-input-query-params.sortBy]: base-input-query-params.sortDirection },
  //     skip: base-input-query-params.calculateSkip(),
  //     take: base-input-query-params.pageSize,
  //     include: {
  //       photos: { where: { isDeleted: false } },
  //     },
  //   });
  //   return PaginatedViewDto.mapToView({
  //     items: post.map((post) => this.mapToOutput(post)),
  //     page: base-input-query-params.pageNumber,
  //     size: base-input-query-params.pageSize,
  //     totalCount: totalCount,
  //   });
  //   // return post.map((post) => this.mapToOutput(post));
  // }
}
