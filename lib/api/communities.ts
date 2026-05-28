import { z } from "zod";
import { api } from "@/lib/api-client";
import { parsedServerFetch } from "@/lib/server-api-client";
import {
  CommunityDetailResponseSchema,
  CommunityMembershipSchema,
  CommunityMemberItemSchema,
  CommunityPageSchema,
  UserCommunityItemSchema,
  type CommunitySummaryResponse,
} from "@/types/forum";

// Tiny ad-hoc shapes for two endpoints that don't have a domain home.
const UploadedImageUrlSchema = z.object({ url: z.string() });
const MyMembershipsListSchema = z.object({
  items: z.array(z.object({ communityId: z.string().optional() })),
});

export const uploadCommunityImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.parsed.upload("/api/forum/media/image", UploadedImageUrlSchema, formData);
};

export const fetchCommunities = (page = 1, pageSize = 20) =>
  api.parsed.get(
    `/api/forum/communities?page=${page}&pageSize=${pageSize}`,
    CommunityPageSchema,
  );

export const fetchCommunityBySlug = (slug: string) =>
  api.parsed.get(`/api/forum/communities/by-slug/${slug}`, CommunityDetailResponseSchema);

export const createCommunity = (body: {
  name: string;
  description?: string;
  privacy?: string;
  imageUrl?: string;
}) => api.parsed.post("/api/forum/communities", CommunityDetailResponseSchema, body);

export const updateCommunity = (communityId: string, body: Partial<CommunitySummaryResponse>) =>
  api.parsed.put(
    `/api/forum/communities/${communityId}`,
    CommunityDetailResponseSchema,
    body,
  );

export const deleteCommunity = (communityId: string) =>
  api.delete<void>(`/api/forum/communities/${communityId}`);

export const fetchMembership = (communityId: string) =>
  api.parsed.get(
    `/api/forum/communities/${communityId}/membership`,
    CommunityMembershipSchema,
  );

export const joinCommunity = (communityId: string) =>
  api.post(`/api/forum/communities/${communityId}/join`);

export const fetchMyMemberships = () =>
  api.parsed.get("/api/forum/memberships", MyMembershipsListSchema);

export const fetchCommunityMembers = (communityId: string) =>
  api.parsed.get(
    `/api/forum/communities/${communityId}/members`,
    z.array(CommunityMemberItemSchema),
  );

export const appointModerator = (membershipId: string) =>
  api.post(`/api/forum/memberships/${membershipId}/moderator`, {});

export const removeModerator = (membershipId: string) =>
  api.delete(`/api/forum/memberships/${membershipId}/moderator`);

export const fetchCommunitiesServer = (
  cookieHeader?: string,
  page = 1,
  pageSize = 20,
  /** When true, returns only communities the authenticated caller has
   *  joined. Anonymous callers always get an empty list with mine=true. */
  mine = false,
) => {
  const qs = `page=${page}&pageSize=${pageSize}${mine ? "&membership=mine" : ""}`;
  return parsedServerFetch(`/api/forum/communities?${qs}`, CommunityPageSchema, cookieHeader);
};

export const fetchCommunityBySlugServer = (slug: string, cookieHeader?: string) =>
  parsedServerFetch(
    `/api/forum/communities/by-slug/${slug}`,
    CommunityDetailResponseSchema,
    cookieHeader,
  );

export const fetchMyMembershipsServer = (cookieHeader: string) =>
  parsedServerFetch("/api/forum/memberships", MyMembershipsListSchema, cookieHeader);

export const fetchMembershipServer = (communityId: string, cookieHeader: string) =>
  parsedServerFetch(
    `/api/forum/communities/${communityId}/membership`,
    CommunityMembershipSchema,
    cookieHeader,
  );

export const fetchProfileMembershipsApi = (userId: string) =>
  api.parsed.get(
    `/api/forum/profiles/${userId}/memberships`,
    z.array(UserCommunityItemSchema),
  );
