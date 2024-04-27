/* eslint-disable */
import _m0 from "protobufjs/minimal.js";

export const protobufPackage = "weaviate.v1";

export enum TenantActivityStatus {
  TENANT_ACTIVITY_STATUS_UNSPECIFIED = 0,
  TENANT_ACTIVITY_STATUS_HOT = 1,
  TENANT_ACTIVITY_STATUS_COLD = 2,
  TENANT_ACTIVITY_STATUS_WARM = 3,
  TENANT_ACTIVITY_STATUS_FROZEN = 4,
  UNRECOGNIZED = -1,
}

export function tenantActivityStatusFromJSON(object: any): TenantActivityStatus {
  switch (object) {
    case 0:
    case "TENANT_ACTIVITY_STATUS_UNSPECIFIED":
      return TenantActivityStatus.TENANT_ACTIVITY_STATUS_UNSPECIFIED;
    case 1:
    case "TENANT_ACTIVITY_STATUS_HOT":
      return TenantActivityStatus.TENANT_ACTIVITY_STATUS_HOT;
    case 2:
    case "TENANT_ACTIVITY_STATUS_COLD":
      return TenantActivityStatus.TENANT_ACTIVITY_STATUS_COLD;
    case 3:
    case "TENANT_ACTIVITY_STATUS_WARM":
      return TenantActivityStatus.TENANT_ACTIVITY_STATUS_WARM;
    case 4:
    case "TENANT_ACTIVITY_STATUS_FROZEN":
      return TenantActivityStatus.TENANT_ACTIVITY_STATUS_FROZEN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return TenantActivityStatus.UNRECOGNIZED;
  }
}

export function tenantActivityStatusToJSON(object: TenantActivityStatus): string {
  switch (object) {
    case TenantActivityStatus.TENANT_ACTIVITY_STATUS_UNSPECIFIED:
      return "TENANT_ACTIVITY_STATUS_UNSPECIFIED";
    case TenantActivityStatus.TENANT_ACTIVITY_STATUS_HOT:
      return "TENANT_ACTIVITY_STATUS_HOT";
    case TenantActivityStatus.TENANT_ACTIVITY_STATUS_COLD:
      return "TENANT_ACTIVITY_STATUS_COLD";
    case TenantActivityStatus.TENANT_ACTIVITY_STATUS_WARM:
      return "TENANT_ACTIVITY_STATUS_WARM";
    case TenantActivityStatus.TENANT_ACTIVITY_STATUS_FROZEN:
      return "TENANT_ACTIVITY_STATUS_FROZEN";
    case TenantActivityStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface TenantsGetRequest {
  collection: string;
  isConsistent: boolean;
  names?: TenantNames | undefined;
}

export interface TenantNames {
  values: string[];
}

export interface TenantsGetReply {
  took: number;
  tenants: Tenant[];
}

export interface Tenant {
  name: string;
  activityStatus: TenantActivityStatus;
}

function createBaseTenantsGetRequest(): TenantsGetRequest {
  return { collection: "", isConsistent: false, names: undefined };
}

export const TenantsGetRequest = {
  encode(message: TenantsGetRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.collection !== "") {
      writer.uint32(10).string(message.collection);
    }
    if (message.isConsistent === true) {
      writer.uint32(16).bool(message.isConsistent);
    }
    if (message.names !== undefined) {
      TenantNames.encode(message.names, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TenantsGetRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTenantsGetRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.collection = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.isConsistent = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.names = TenantNames.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TenantsGetRequest {
    return {
      collection: isSet(object.collection) ? globalThis.String(object.collection) : "",
      isConsistent: isSet(object.isConsistent) ? globalThis.Boolean(object.isConsistent) : false,
      names: isSet(object.names) ? TenantNames.fromJSON(object.names) : undefined,
    };
  },

  toJSON(message: TenantsGetRequest): unknown {
    const obj: any = {};
    if (message.collection !== "") {
      obj.collection = message.collection;
    }
    if (message.isConsistent === true) {
      obj.isConsistent = message.isConsistent;
    }
    if (message.names !== undefined) {
      obj.names = TenantNames.toJSON(message.names);
    }
    return obj;
  },

  create(base?: DeepPartial<TenantsGetRequest>): TenantsGetRequest {
    return TenantsGetRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TenantsGetRequest>): TenantsGetRequest {
    const message = createBaseTenantsGetRequest();
    message.collection = object.collection ?? "";
    message.isConsistent = object.isConsistent ?? false;
    message.names = (object.names !== undefined && object.names !== null)
      ? TenantNames.fromPartial(object.names)
      : undefined;
    return message;
  },
};

function createBaseTenantNames(): TenantNames {
  return { values: [] };
}

export const TenantNames = {
  encode(message: TenantNames, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TenantNames {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTenantNames();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.values.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TenantNames {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: TenantNames): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },

  create(base?: DeepPartial<TenantNames>): TenantNames {
    return TenantNames.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TenantNames>): TenantNames {
    const message = createBaseTenantNames();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseTenantsGetReply(): TenantsGetReply {
  return { took: 0, tenants: [] };
}

export const TenantsGetReply = {
  encode(message: TenantsGetReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.took !== 0) {
      writer.uint32(13).float(message.took);
    }
    for (const v of message.tenants) {
      Tenant.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TenantsGetReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTenantsGetReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.took = reader.float();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.tenants.push(Tenant.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TenantsGetReply {
    return {
      took: isSet(object.took) ? globalThis.Number(object.took) : 0,
      tenants: globalThis.Array.isArray(object?.tenants) ? object.tenants.map((e: any) => Tenant.fromJSON(e)) : [],
    };
  },

  toJSON(message: TenantsGetReply): unknown {
    const obj: any = {};
    if (message.took !== 0) {
      obj.took = message.took;
    }
    if (message.tenants?.length) {
      obj.tenants = message.tenants.map((e) => Tenant.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<TenantsGetReply>): TenantsGetReply {
    return TenantsGetReply.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TenantsGetReply>): TenantsGetReply {
    const message = createBaseTenantsGetReply();
    message.took = object.took ?? 0;
    message.tenants = object.tenants?.map((e) => Tenant.fromPartial(e)) || [];
    return message;
  },
};

function createBaseTenant(): Tenant {
  return { name: "", activityStatus: 0 };
}

export const Tenant = {
  encode(message: Tenant, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.activityStatus !== 0) {
      writer.uint32(16).int32(message.activityStatus);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Tenant {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTenant();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.activityStatus = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Tenant {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      activityStatus: isSet(object.activityStatus) ? tenantActivityStatusFromJSON(object.activityStatus) : 0,
    };
  },

  toJSON(message: Tenant): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.activityStatus !== 0) {
      obj.activityStatus = tenantActivityStatusToJSON(message.activityStatus);
    }
    return obj;
  },

  create(base?: DeepPartial<Tenant>): Tenant {
    return Tenant.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Tenant>): Tenant {
    const message = createBaseTenant();
    message.name = object.name ?? "";
    message.activityStatus = object.activityStatus ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
