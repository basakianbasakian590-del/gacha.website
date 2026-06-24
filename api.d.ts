import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthResponse, BalanceAdjust, Chest, ChestInput, ChestUpdate, ErrorResponse, GachaHistory, GachaItem, GachaItemInput, GachaItemUpdate, GachaPullInput, GachaPullResult, GachaStats, HealthStatus, ListItemsParams, LoginInput, RenewInput, SiteSettings, SiteSettingsUpdate, SuccessResponse, TransferInput, TransferResult, User, UserInput, UserUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLoginUrl: () => string;
/**
 * @summary Login with username and password
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary Login with username and password
*/
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout current user
 */
export declare const logout: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout current user
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current logged-in user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current logged-in user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListUsersUrl: () => string;
/**
 * @summary List all users (admin only)
 */
export declare const listUsers: (options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users (admin only)
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateUserUrl: () => string;
/**
 * @summary Create a new user (admin only)
 */
export declare const createUser: (userInput: UserInput, options?: RequestInit) => Promise<User>;
export declare const getCreateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
export type CreateUserMutationResult = NonNullable<Awaited<ReturnType<typeof createUser>>>;
export type CreateUserMutationBody = BodyType<UserInput>;
export type CreateUserMutationError = ErrorType<unknown>;
/**
* @summary Create a new user (admin only)
*/
export declare const useCreateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
export declare const getGetUserUrl: (id: number) => string;
/**
 * @summary Get user by ID
 */
export declare const getUser: (id: number, options?: RequestInit) => Promise<User>;
export declare const getGetUserQueryKey: (id: number) => readonly [`/api/users/${number}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<unknown>;
/**
 * @summary Get user by ID
 */
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserUrl: (id: number) => string;
/**
 * @summary Update user (admin only)
 */
export declare const updateUser: (id: number, userUpdate: UserUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UserUpdate>;
export type UpdateUserMutationError = ErrorType<unknown>;
/**
* @summary Update user (admin only)
*/
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export declare const getDeleteUserUrl: (id: number) => string;
/**
 * @summary Delete user (admin only)
 */
export declare const deleteUser: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export type DeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUser>>>;
export type DeleteUserMutationError = ErrorType<unknown>;
/**
* @summary Delete user (admin only)
*/
export declare const useDeleteUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export declare const getAdjustBalanceUrl: (id: number) => string;
/**
 * @summary Add or set balance for user (admin only)
 */
export declare const adjustBalance: (id: number, balanceAdjust: BalanceAdjust, options?: RequestInit) => Promise<User>;
export declare const getAdjustBalanceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adjustBalance>>, TError, {
        id: number;
        data: BodyType<BalanceAdjust>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adjustBalance>>, TError, {
    id: number;
    data: BodyType<BalanceAdjust>;
}, TContext>;
export type AdjustBalanceMutationResult = NonNullable<Awaited<ReturnType<typeof adjustBalance>>>;
export type AdjustBalanceMutationBody = BodyType<BalanceAdjust>;
export type AdjustBalanceMutationError = ErrorType<unknown>;
/**
* @summary Add or set balance for user (admin only)
*/
export declare const useAdjustBalance: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adjustBalance>>, TError, {
        id: number;
        data: BodyType<BalanceAdjust>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adjustBalance>>, TError, {
    id: number;
    data: BodyType<BalanceAdjust>;
}, TContext>;
export declare const getTransferBalanceUrl: () => string;
/**
 * @summary Transfer balance to another user by username
 */
export declare const transferBalance: (transferInput: TransferInput, options?: RequestInit) => Promise<TransferResult>;
export declare const getTransferBalanceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transferBalance>>, TError, {
        data: BodyType<TransferInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof transferBalance>>, TError, {
    data: BodyType<TransferInput>;
}, TContext>;
export type TransferBalanceMutationResult = NonNullable<Awaited<ReturnType<typeof transferBalance>>>;
export type TransferBalanceMutationBody = BodyType<TransferInput>;
export type TransferBalanceMutationError = ErrorType<unknown>;
/**
* @summary Transfer balance to another user by username
*/
export declare const useTransferBalance: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof transferBalance>>, TError, {
        data: BodyType<TransferInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof transferBalance>>, TError, {
    data: BodyType<TransferInput>;
}, TContext>;
export declare const getRenewAccountUrl: () => string;
/**
 * @summary Renew account expiry using balance (member only)
 */
export declare const renewAccount: (renewInput: RenewInput, options?: RequestInit) => Promise<User>;
export declare const getRenewAccountMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof renewAccount>>, TError, {
        data: BodyType<RenewInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof renewAccount>>, TError, {
    data: BodyType<RenewInput>;
}, TContext>;
export type RenewAccountMutationResult = NonNullable<Awaited<ReturnType<typeof renewAccount>>>;
export type RenewAccountMutationBody = BodyType<RenewInput>;
export type RenewAccountMutationError = ErrorType<unknown>;
/**
* @summary Renew account expiry using balance (member only)
*/
export declare const useRenewAccount: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof renewAccount>>, TError, {
        data: BodyType<RenewInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof renewAccount>>, TError, {
    data: BodyType<RenewInput>;
}, TContext>;
export declare const getListChestsUrl: () => string;
/**
 * @summary List all gacha chests
 */
export declare const listChests: (options?: RequestInit) => Promise<Chest[]>;
export declare const getListChestsQueryKey: () => readonly ["/api/chests"];
export declare const getListChestsQueryOptions: <TData = Awaited<ReturnType<typeof listChests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listChests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListChestsQueryResult = NonNullable<Awaited<ReturnType<typeof listChests>>>;
export type ListChestsQueryError = ErrorType<unknown>;
/**
 * @summary List all gacha chests
 */
export declare function useListChests<TData = Awaited<ReturnType<typeof listChests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateChestUrl: () => string;
/**
 * @summary Create a chest (admin only)
 */
export declare const createChest: (chestInput: ChestInput, options?: RequestInit) => Promise<Chest>;
export declare const getCreateChestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChest>>, TError, {
        data: BodyType<ChestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createChest>>, TError, {
    data: BodyType<ChestInput>;
}, TContext>;
export type CreateChestMutationResult = NonNullable<Awaited<ReturnType<typeof createChest>>>;
export type CreateChestMutationBody = BodyType<ChestInput>;
export type CreateChestMutationError = ErrorType<unknown>;
/**
* @summary Create a chest (admin only)
*/
export declare const useCreateChest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChest>>, TError, {
        data: BodyType<ChestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createChest>>, TError, {
    data: BodyType<ChestInput>;
}, TContext>;
export declare const getUpdateChestUrl: (id: number) => string;
/**
 * @summary Update chest (admin only)
 */
export declare const updateChest: (id: number, chestUpdate: ChestUpdate, options?: RequestInit) => Promise<Chest>;
export declare const getUpdateChestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateChest>>, TError, {
        id: number;
        data: BodyType<ChestUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateChest>>, TError, {
    id: number;
    data: BodyType<ChestUpdate>;
}, TContext>;
export type UpdateChestMutationResult = NonNullable<Awaited<ReturnType<typeof updateChest>>>;
export type UpdateChestMutationBody = BodyType<ChestUpdate>;
export type UpdateChestMutationError = ErrorType<unknown>;
/**
* @summary Update chest (admin only)
*/
export declare const useUpdateChest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateChest>>, TError, {
        id: number;
        data: BodyType<ChestUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateChest>>, TError, {
    id: number;
    data: BodyType<ChestUpdate>;
}, TContext>;
export declare const getDeleteChestUrl: (id: number) => string;
/**
 * @summary Delete chest (admin only)
 */
export declare const deleteChest: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteChestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteChest>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteChest>>, TError, {
    id: number;
}, TContext>;
export type DeleteChestMutationResult = NonNullable<Awaited<ReturnType<typeof deleteChest>>>;
export type DeleteChestMutationError = ErrorType<unknown>;
/**
* @summary Delete chest (admin only)
*/
export declare const useDeleteChest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteChest>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteChest>>, TError, {
    id: number;
}, TContext>;
export declare const getListItemsUrl: (params?: ListItemsParams) => string;
/**
 * @summary List all gacha items (optionally filter by chest_id)
 */
export declare const listItems: (params?: ListItemsParams, options?: RequestInit) => Promise<GachaItem[]>;
export declare const getListItemsQueryKey: (params?: ListItemsParams) => readonly ["/api/items", ...ListItemsParams[]];
export declare const getListItemsQueryOptions: <TData = Awaited<ReturnType<typeof listItems>>, TError = ErrorType<unknown>>(params?: ListItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListItemsQueryResult = NonNullable<Awaited<ReturnType<typeof listItems>>>;
export type ListItemsQueryError = ErrorType<unknown>;
/**
 * @summary List all gacha items (optionally filter by chest_id)
 */
export declare function useListItems<TData = Awaited<ReturnType<typeof listItems>>, TError = ErrorType<unknown>>(params?: ListItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateItemUrl: () => string;
/**
 * @summary Create a gacha item (admin only)
 */
export declare const createItem: (gachaItemInput: GachaItemInput, options?: RequestInit) => Promise<GachaItem>;
export declare const getCreateItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createItem>>, TError, {
        data: BodyType<GachaItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createItem>>, TError, {
    data: BodyType<GachaItemInput>;
}, TContext>;
export type CreateItemMutationResult = NonNullable<Awaited<ReturnType<typeof createItem>>>;
export type CreateItemMutationBody = BodyType<GachaItemInput>;
export type CreateItemMutationError = ErrorType<unknown>;
/**
* @summary Create a gacha item (admin only)
*/
export declare const useCreateItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createItem>>, TError, {
        data: BodyType<GachaItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createItem>>, TError, {
    data: BodyType<GachaItemInput>;
}, TContext>;
export declare const getUpdateItemUrl: (id: number) => string;
/**
 * @summary Update gacha item (admin only)
 */
export declare const updateItem: (id: number, gachaItemUpdate: GachaItemUpdate, options?: RequestInit) => Promise<GachaItem>;
export declare const getUpdateItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateItem>>, TError, {
        id: number;
        data: BodyType<GachaItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateItem>>, TError, {
    id: number;
    data: BodyType<GachaItemUpdate>;
}, TContext>;
export type UpdateItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateItem>>>;
export type UpdateItemMutationBody = BodyType<GachaItemUpdate>;
export type UpdateItemMutationError = ErrorType<unknown>;
/**
* @summary Update gacha item (admin only)
*/
export declare const useUpdateItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateItem>>, TError, {
        id: number;
        data: BodyType<GachaItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateItem>>, TError, {
    id: number;
    data: BodyType<GachaItemUpdate>;
}, TContext>;
export declare const getDeleteItemUrl: (id: number) => string;
/**
 * @summary Delete gacha item (admin only)
 */
export declare const deleteItem: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteItem>>, TError, {
    id: number;
}, TContext>;
export type DeleteItemMutationResult = NonNullable<Awaited<ReturnType<typeof deleteItem>>>;
export type DeleteItemMutationError = ErrorType<unknown>;
/**
* @summary Delete gacha item (admin only)
*/
export declare const useDeleteItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteItem>>, TError, {
    id: number;
}, TContext>;
export declare const getPullGachaUrl: () => string;
/**
 * @summary Pull gacha from a chest
 */
export declare const pullGacha: (gachaPullInput: GachaPullInput, options?: RequestInit) => Promise<GachaPullResult>;
export declare const getPullGachaMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof pullGacha>>, TError, {
        data: BodyType<GachaPullInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof pullGacha>>, TError, {
    data: BodyType<GachaPullInput>;
}, TContext>;
export type PullGachaMutationResult = NonNullable<Awaited<ReturnType<typeof pullGacha>>>;
export type PullGachaMutationBody = BodyType<GachaPullInput>;
export type PullGachaMutationError = ErrorType<unknown>;
/**
* @summary Pull gacha from a chest
*/
export declare const usePullGacha: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof pullGacha>>, TError, {
        data: BodyType<GachaPullInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof pullGacha>>, TError, {
    data: BodyType<GachaPullInput>;
}, TContext>;
export declare const getListGachaHistoryUrl: () => string;
/**
 * @summary Get gacha pull history for current user
 */
export declare const listGachaHistory: (options?: RequestInit) => Promise<GachaHistory[]>;
export declare const getListGachaHistoryQueryKey: () => readonly ["/api/gacha/history"];
export declare const getListGachaHistoryQueryOptions: <TData = Awaited<ReturnType<typeof listGachaHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGachaHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGachaHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGachaHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof listGachaHistory>>>;
export type ListGachaHistoryQueryError = ErrorType<unknown>;
/**
 * @summary Get gacha pull history for current user
 */
export declare function useListGachaHistory<TData = Awaited<ReturnType<typeof listGachaHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGachaHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetGachaStatsUrl: () => string;
/**
 * @summary Get gacha statistics (admin dashboard)
 */
export declare const getGachaStats: (options?: RequestInit) => Promise<GachaStats>;
export declare const getGetGachaStatsQueryKey: () => readonly ["/api/gacha/stats"];
export declare const getGetGachaStatsQueryOptions: <TData = Awaited<ReturnType<typeof getGachaStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGachaStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getGachaStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetGachaStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getGachaStats>>>;
export type GetGachaStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get gacha statistics (admin dashboard)
 */
export declare function useGetGachaStats<TData = Awaited<ReturnType<typeof getGachaStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGachaStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSettingsUrl: () => string;
/**
 * @summary Get site settings
 */
export declare const getSettings: (options?: RequestInit) => Promise<SiteSettings>;
export declare const getGetSettingsQueryKey: () => readonly ["/api/settings"];
export declare const getGetSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getSettings>>>;
export type GetSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get site settings
 */
export declare function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateSettingsUrl: () => string;
/**
 * @summary Update site settings (admin only)
 */
export declare const updateSettings: (siteSettingsUpdate: SiteSettingsUpdate, options?: RequestInit) => Promise<SiteSettings>;
export declare const getUpdateSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SiteSettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SiteSettingsUpdate>;
}, TContext>;
export type UpdateSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateSettings>>>;
export type UpdateSettingsMutationBody = BodyType<SiteSettingsUpdate>;
export type UpdateSettingsMutationError = ErrorType<unknown>;
/**
* @summary Update site settings (admin only)
*/
export declare const useUpdateSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SiteSettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SiteSettingsUpdate>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map