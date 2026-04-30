export interface PaginationParams {
	page: number;
	limit: number;
	skip: number;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

/**
 * Parse pagination query params (page, limit) and return Prisma skip/take params
 * @param query - Express query object
 * @param defaultLimit - Default limit per page (default: 10)
 * @returns Object with page, limit, and skip for Prisma
 */
export const getPaginationParams = (
	query: any,
	defaultLimit: number = 10,
): PaginationParams => {
	const page = Math.max(1, parseInt(query.page) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(query.limit) || defaultLimit),
	);

	const skip = (page - 1) * limit;

	return {
		page,
		limit,
		skip,
	};
};

/**
 * Build pagination metadata
 * @param page - Current page
 * @param limit - Items per page
 * @param total - Total items count
 * @returns Pagination metadata with hasNext, hasPrev, totalPages
 */
export const buildPaginationMeta = (
	page: number,
	limit: number,
	total: number,
): PaginationMeta => {
	const totalPages = Math.ceil(total / limit);

	return {
		page,
		limit,
		total,
		totalPages,
		hasNext: page < totalPages,
		hasPrev: page > 1,
	};
};

/**
 * Helper to use in controllers - returns both params and meta building function
 */
export const usePagination = (query: any, defaultLimit: number = 10) => {
	const params = getPaginationParams(query, defaultLimit);

	return {
		...params,
		buildMeta: (total: number) =>
			buildPaginationMeta(params.page, params.limit, total),
	};
};
