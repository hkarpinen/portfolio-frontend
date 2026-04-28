import { api } from "@/lib/api-client";
import { serverFetch } from "@/lib/server-api-client";
import type {
  CommunitySummaryResponse,
  CommunityDetailResponse,
  CommunityMembership,
  CommunityMemberItem,
  CommunityPage,
  UserCommunityItem,
} from "@/types/forum";

export const uploadCommunityImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<{ url: string }>("/api/forum/media/image", formData);
};

export const fetchCommunities = (page = 1, pageSize = 20) =>
  api.get<CommunityPage>(`/api/forum/communities?page=${page}&pageSize=${pageSize}`);

export const fetchCommunityBySlug = (slug: string) =>
  api.get<CommunityDetailResponse>(`/api/forum/communities/by-slug/${slug}`);

export const createCommunity = (body: { name: string; description?: string; privacy?: string; imageUrl?: string }) =>
  api.post<CommunityDetailResponse>("/api/forum/communities", body);

export const updateCommunity = (communityId: string, body: Partial<CommunitySummaryResponse>) =>
  api.put<CommunityDetailResponse>(`/api/forum/communities/${communityId}`, body);

export const deleteCommunity = (communityId: string) =>
  api.delete<void>(`/api/forum/communities/${communityId}`);

export const fetchMembership = (communityId: string) =>
  api.get<CommunityMembership>(`/api/forum/communities/${communityId}/membership`);

export const joinCommunity = (communityId: string) =>
  api.post(`/api/forum/communities/${communityId}/join`);

export const fetchMyMemberships = () =>
  api.get<{ items: Array<{ communityId?: string }> }>("/api/forum/memberships");

export const fetchCommunityMembers = (communityId: string) =>
  api.get<CommunityMemberItem[]>(`/api/forum/communities/${communityId}/members`);

export const appointModerator = (membershipId: string) =>
  api.post(`/api/forum/memberships/${membershipId}/moderator`, {});

export const removeModerator = (membershipId: string) =>
  api.delete(`/api/forum/memberships/${membershipId}/moderator`);

export const fetchCommunitiesServer = (
  cookieHeader?: string,
  page = 1,
  pageSize = 20,
) =>
  serverFetch<CommunityPage>(
    `/api/forum/communities?page=${page}&pageSize=${pageSize}`,
    cookieHeader,
  );

export const fetchCommunityBySlugServer = (
  slug: string,
  cookieHeader?: string,
) =>
  serverFetch<CommunityDetailResponse>(
    `/api/forum/communities/by-slug/${slug}`,
    cookieHeader,
  );

export const fetchMyMembershipsServer = (cookieHeader: string) =>
  serverFetch<{ items: Array<{ communityId?: string }> }>(
    "/api/forum/memberships",
    cookieHeader,
  );

export const fetchMembershipServer = (
  communityId: string,
  cookieHeader: string,
) =>
  serverFetch<CommunityMembership>(
    `/api/forum/communities/${communityId}/membership`,
    cookieHeader,
  );

export const fetchProfileMembershipsApi = (userId: string) =>
  api.get<UserCommunityItem[]>(`/api/forum/profiles/${userId}/memberships`);
