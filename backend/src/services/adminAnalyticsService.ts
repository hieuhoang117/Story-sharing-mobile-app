import {
  follows_status,
  posts_status,
  posts_visibility,
  reports_status,
} from '@prisma/client';
import prisma from '../config/db';

const getUtcDayStart = (date: Date) =>
	new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const getUtcWeekStart = (date: Date) => {
	const start = getUtcDayStart(date);
	const dayOfWeek = start.getUTCDay();
	start.setUTCDate(start.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
	return start;
};

const getMonthStart = (date: Date) =>
	new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const formatMonth = (date: Date) =>
	new Intl.DateTimeFormat('vi-VN', { month: 'short', timeZone: 'UTC' }).format(date);

const toCount = (value: bigint | number) => Number(value);

const createDailyTrend = (
	start: Date,
	likes: Array<{ day: string; count: bigint }>,
	comments: Array<{ day: string; count: bigint }>,
	reposts: Array<{ day: string; count: bigint }>,
) => {
	const toDayMap = (rows: Array<{ day: string; count: bigint }>) =>
		new Map(rows.map((row) => [row.day, toCount(row.count)]));
	const likeCounts = toDayMap(likes);
	const commentCounts = toDayMap(comments);
	const repostCounts = toDayMap(reposts);

	return Array.from({ length: 7 }, (_, index) => {
		const date = new Date(start);
		date.setUTCDate(date.getUTCDate() + index);
		const day = date.toISOString().slice(0, 10);
		return {
			day,
			likes: likeCounts.get(day) ?? 0,
			comments: commentCounts.get(day) ?? 0,
			reposts: repostCounts.get(day) ?? 0,
		};
	});
};

export const getAdminAnalytics = async () => {
	const now = new Date();
	const todayStart = getUtcDayStart(now);
	const tomorrowStart = new Date(todayStart);
	tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
	const weekStart = getUtcWeekStart(now);
	const nextWeekStart = new Date(weekStart);
	nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);
	const currentMonthStart = getMonthStart(now);
	const months = Array.from({ length: 6 }, (_, index) =>
		new Date(Date.UTC(
			currentMonthStart.getUTCFullYear(),
			currentMonthStart.getUTCMonth() - 5 + index,
			1,
		)),
	);
	const trendStart = new Date(todayStart);
	trendStart.setUTCDate(trendStart.getUTCDate() - 6);

	const [totalUsers, totalPosts, totalLikes, pendingReports, newUsersToday,
		newPostsToday, newUsersThisWeek, newPostsThisWeek, monthlyCounts,
		reports, reportStatusGroups, reportReasonGroups, reportedUserGroups,
		postStatusGroups, postVisibilityGroups, topPosts, topPostAuthorGroups,
		topFollowerGroups, peakHourRows, averageInteractions, dailyLikes,
		dailyComments, dailyReposts] = await Promise.all([
		prisma.users.count(),
		prisma.posts.count(),
		prisma.likes.count(),
		prisma.reports.count({ where: { status: reports_status.pending } }),
		prisma.users.count({ where: { created_at: { gte: todayStart, lt: tomorrowStart } } }),
		prisma.posts.count({ where: { created_at: { gte: todayStart, lt: tomorrowStart } } }),
		prisma.users.count({ where: { created_at: { gte: weekStart, lt: nextWeekStart } } }),
		prisma.posts.count({ where: { created_at: { gte: weekStart, lt: nextWeekStart } } }),
		Promise.all(
			months.map(async (month) => {
				const nextMonth = new Date(Date.UTC(
					month.getUTCFullYear(),
					month.getUTCMonth() + 1,
					1,
				));
				const dateRange = { gte: month, lt: nextMonth };
				const [users, posts] = await Promise.all([
					prisma.users.count({ where: { created_at: dateRange } }),
					prisma.posts.count({ where: { created_at: dateRange } }),
				]);
				return { month: formatMonth(month), users, posts };
			}),
		),
		prisma.reports.findMany({
			take: 10,
			orderBy: { created_at: 'desc' },
			select: {
				id: true,
				reporter_id: true,
				post_id: true,
				reported_user_id: true,
				reason: true,
				status: true,
				created_at: true,
			},
		}),
		prisma.reports.groupBy({ by: ['status'], _count: { _all: true } }),
		prisma.reports.groupBy({
			by: ['reason'],
			_count: { _all: true },
			orderBy: { _count: { reason: 'desc' } },
		}),
		prisma.reports.groupBy({
			by: ['reported_user_id'],
			where: { reported_user_id: { not: null } },
			_count: { _all: true },
			orderBy: { _count: { reported_user_id: 'desc' } },
			take: 10,
		}),
		prisma.posts.groupBy({ by: ['status'], _count: { _all: true } }),
		prisma.posts.groupBy({ by: ['visibility'], _count: { _all: true } }),
		prisma.posts.findMany({
			take: 10,
			orderBy: [{ like_count: 'desc' }, { created_at: 'desc' }],
			select: {
				id: true,
				content: true,
				user_id: true,
				like_count: true,
				reply_count: true,
				repost_count: true,
			},
		}),
		prisma.posts.groupBy({
			by: ['user_id'],
			_count: { _all: true },
			orderBy: { _count: { user_id: 'desc' } },
			take: 10,
		}),
		prisma.follows.groupBy({
			by: ['following_id'],
			where: { status: follows_status.accepted },
			_count: { _all: true },
			orderBy: { _count: { following_id: 'desc' } },
			take: 10,
		}),
		prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
			SELECT HOUR(created_at) AS hour, COUNT(*) AS count
			FROM posts
			GROUP BY HOUR(created_at)
		`,
		prisma.posts.aggregate({
			_sum: { like_count: true, reply_count: true, repost_count: true },
			_count: { _all: true },
		}),
		prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
			SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS count
			FROM likes
			WHERE created_at >= ${trendStart} AND created_at < ${tomorrowStart}
			GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
		`,
		prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
			SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS count
			FROM posts
			WHERE parent_post_id IS NOT NULL
				AND created_at >= ${trendStart} AND created_at < ${tomorrowStart}
			GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
		`,
		prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
			SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS count
			FROM reposts
			WHERE created_at >= ${trendStart} AND created_at < ${tomorrowStart}
			GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
		`,
	]);

	const currentMonthUsers = monthlyCounts[5]?.users ?? 0;
	const previousMonthUsers = monthlyCounts[4]?.users ?? 0;
	const userGrowthPercentage = previousMonthUsers === 0
		? currentMonthUsers === 0 ? 0 : 100
		: ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100;

	const reportedUserIds = reportedUserGroups
		.map((group) => group.reported_user_id)
		.filter((id): id is string => id !== null);
	const topPostUserIds = [...new Set([
		...topPosts.map((post) => post.user_id),
		...topPostAuthorGroups.map((group) => group.user_id),
		...topFollowerGroups.map((group) => group.following_id),
	])];
	const userIds = [...new Set([...reportedUserIds, ...topPostUserIds])];
	const topPostAuthorIds = topPostAuthorGroups.map((group) => group.user_id);
	const [users, reportedUsers, topPostFollowerGroups] = await Promise.all([
		prisma.users.findMany({
			where: { id: { in: userIds } },
			select: { id: true, username: true },
		}),
		prisma.users.findMany({
			where: { id: { in: reportedUserIds } },
			select: { id: true, username: true },
		}),
		topPostAuthorIds.length
			? prisma.follows.groupBy({
				by: ['following_id'],
				where: {
					status: follows_status.accepted,
					following_id: { in: topPostAuthorIds },
				},
				_count: { _all: true },
			})
			: Promise.resolve([]),
	]);
	const usernameById = new Map(users.map((user) => [user.id, user.username]));
	const reportedUsernameById = new Map(reportedUsers.map((user) => [user.id, user.username]));
	const postCounts = new Map(topPostAuthorGroups.map((group) => [group.user_id, group._count._all]));
	const followerCounts = new Map(topFollowerGroups.map((group) => [group.following_id, group._count._all]));
	const topPostFollowerCounts = new Map(topPostFollowerGroups.map((group) => [group.following_id, group._count._all]));

	return {
		metrics: {
			totalUsers,
			userGrowthPercentage: Number(userGrowthPercentage.toFixed(1)),
			totalPosts,
			totalLikes,
			pendingReports,
			newUsersToday,
			newPostsToday,
			newUsersThisWeek,
			newPostsThisWeek,
			averageInteractionsPerPost: averageInteractions._count._all === 0
				? 0
				: Number((
					((averageInteractions._sum.like_count ?? 0)
						+ (averageInteractions._sum.reply_count ?? 0)
						+ (averageInteractions._sum.repost_count ?? 0))
					/ averageInteractions._count._all
				).toFixed(1)),
		},
		growthData: monthlyCounts,
		engagementTrend: createDailyTrend(trendStart, dailyLikes, dailyComments, dailyReposts),
		topPosts: topPosts.map((post) => ({
			id: post.id,
			content: post.content?.trim() || '(Bài viết không có nội dung văn bản)',
			author: usernameById.get(post.user_id) ?? post.user_id,
			likes: post.like_count,
			comments: post.reply_count,
			reposts: post.repost_count,
		})),
		topUsersByPosts: topPostAuthorGroups.map((group) => ({
			id: group.user_id,
			username: usernameById.get(group.user_id) ?? group.user_id,
			postCount: group._count._all,
			followerCount: topPostFollowerCounts.get(group.user_id) ?? 0,
		})),
		topUsersByFollowers: topFollowerGroups.map((group) => ({
			id: group.following_id,
			username: usernameById.get(group.following_id) ?? group.following_id,
			postCount: postCounts.get(group.following_id) ?? 0,
			followerCount: group._count._all,
		})),
		reportStats: {
			byStatus: Object.values(reports_status).map((status) => ({
				name: status,
				value: reportStatusGroups.find((group) => group.status === status)?._count._all ?? 0,
			})),
			byReason: reportReasonGroups.map((group) => ({
				reason: group.reason,
				reports: group._count._all,
			})),
			repeatReportedUsers: reportedUserGroups.map((group) => ({
				id: group.reported_user_id!,
				username: reportedUsernameById.get(group.reported_user_id!) ?? group.reported_user_id!,
				reportCount: group._count._all,
			})),
		},
		postStats: {
			byStatus: Object.values(posts_status).map((status) => ({
				name: status,
				value: postStatusGroups.find((group) => group.status === status)?._count._all ?? 0,
			})),
			byVisibility: Object.values(posts_visibility).map((visibility) => ({
				name: visibility,
				value: postVisibilityGroups.find((group) => group.visibility === visibility)?._count._all ?? 0,
			})),
			peakHours: Array.from({ length: 24 }, (_, hour) => ({
				hour: `${String(hour).padStart(2, '0')}h`,
				posts: toCount(peakHourRows.find((row) => row.hour === hour)?.count ?? 0),
			})),
		},
		reports,
	};
};

export const updateAdminReportStatus = (id: string, status: reports_status) =>
	prisma.reports.update({
		where: { id },
		data: { status },
		select: {
			id: true,
			reporter_id: true,
			post_id: true,
			reported_user_id: true,
			reason: true,
			status: true,
			created_at: true,
		},
	});
