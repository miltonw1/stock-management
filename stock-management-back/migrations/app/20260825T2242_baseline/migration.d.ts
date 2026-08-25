#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/edb375b0c89a7c599b66f4145d53c326e4d621146af66a47c351b4946bb25c84/contract';
import { Migration } from '@prisma/orm-postgres/migration';
export default class M extends Migration<never, End> {
    readonly endContractJson: {
        _generated: {
            message: string;
            regenerate: string;
            warning: string;
        };
        capabilities: {
            postgres: {
                distinctOn: boolean;
                jsonAgg: boolean;
                lateral: boolean;
                limit: boolean;
                orderBy: boolean;
                returning: boolean;
            };
            sql: {
                checkConstraint: boolean;
                defaultInInsert: boolean;
                enums: boolean;
                lateral: boolean;
                returning: boolean;
                scalarList: boolean;
            };
        };
        domain: {
            namespaces: {
                public: {
                    enum: {
                        user_role: {
                            codecId: string;
                            members: {
                                name: string;
                                value: string;
                            }[];
                        };
                    };
                    models: {
                        Category: {
                            fields: {
                                createdAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                id: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                name: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                tenantId: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                updatedAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                            };
                            relations: {
                                products: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                tenant: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                            };
                            storage: {
                                fields: {
                                    createdAt: {
                                        column: string;
                                    };
                                    id: {
                                        column: string;
                                    };
                                    name: {
                                        column: string;
                                    };
                                    tenantId: {
                                        column: string;
                                    };
                                    updatedAt: {
                                        column: string;
                                    };
                                };
                                namespaceId: string;
                                table: string;
                            };
                        };
                        Location: {
                            fields: {
                                code: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                createdAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                id: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                name: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                tenantId: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                updatedAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                            };
                            relations: {
                                products: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                tenant: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                            };
                            storage: {
                                fields: {
                                    code: {
                                        column: string;
                                    };
                                    createdAt: {
                                        column: string;
                                    };
                                    id: {
                                        column: string;
                                    };
                                    name: {
                                        column: string;
                                    };
                                    tenantId: {
                                        column: string;
                                    };
                                    updatedAt: {
                                        column: string;
                                    };
                                };
                                namespaceId: string;
                                table: string;
                            };
                        };
                        Product: {
                            fields: {
                                categoryId: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                cost: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                createdAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                description: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                id: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                locationId: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                minStock: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                name: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                price: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                stock: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                supplierId: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                tenantId: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                unit: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                updatedAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                            };
                            relations: {
                                category: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                location: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                supplier: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                tenant: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                            };
                            storage: {
                                fields: {
                                    categoryId: {
                                        column: string;
                                    };
                                    cost: {
                                        column: string;
                                    };
                                    createdAt: {
                                        column: string;
                                    };
                                    description: {
                                        column: string;
                                    };
                                    id: {
                                        column: string;
                                    };
                                    locationId: {
                                        column: string;
                                    };
                                    minStock: {
                                        column: string;
                                    };
                                    name: {
                                        column: string;
                                    };
                                    price: {
                                        column: string;
                                    };
                                    stock: {
                                        column: string;
                                    };
                                    supplierId: {
                                        column: string;
                                    };
                                    tenantId: {
                                        column: string;
                                    };
                                    unit: {
                                        column: string;
                                    };
                                    updatedAt: {
                                        column: string;
                                    };
                                };
                                namespaceId: string;
                                table: string;
                            };
                        };
                        Supplier: {
                            fields: {
                                createdAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                email: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                id: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                name: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                phone: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                tenantId: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                updatedAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                            };
                            relations: {
                                products: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                tenant: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                            };
                            storage: {
                                fields: {
                                    createdAt: {
                                        column: string;
                                    };
                                    email: {
                                        column: string;
                                    };
                                    id: {
                                        column: string;
                                    };
                                    name: {
                                        column: string;
                                    };
                                    phone: {
                                        column: string;
                                    };
                                    tenantId: {
                                        column: string;
                                    };
                                    updatedAt: {
                                        column: string;
                                    };
                                };
                                namespaceId: string;
                                table: string;
                            };
                        };
                        Tenant: {
                            fields: {
                                createdAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                id: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                name: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                slug: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                updatedAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                            };
                            relations: {
                                categories: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                locations: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                products: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                suppliers: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                                users: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                            };
                            storage: {
                                fields: {
                                    createdAt: {
                                        column: string;
                                    };
                                    id: {
                                        column: string;
                                    };
                                    name: {
                                        column: string;
                                    };
                                    slug: {
                                        column: string;
                                    };
                                    updatedAt: {
                                        column: string;
                                    };
                                };
                                namespaceId: string;
                                table: string;
                            };
                        };
                        User: {
                            fields: {
                                createdAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                email: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                id: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                name: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                passwordHash: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                role: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                    valueSet: {
                                        entityKind: string;
                                        entityName: string;
                                        namespaceId: string;
                                        plane: string;
                                    };
                                };
                                tenantId: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                                updatedAt: {
                                    nullable: boolean;
                                    type: {
                                        codecId: string;
                                        kind: string;
                                    };
                                };
                            };
                            relations: {
                                tenant: {
                                    cardinality: string;
                                    on: {
                                        localFields: string[];
                                        targetFields: string[];
                                    };
                                    to: {
                                        model: string;
                                        namespace: string;
                                    };
                                };
                            };
                            storage: {
                                fields: {
                                    createdAt: {
                                        column: string;
                                    };
                                    email: {
                                        column: string;
                                    };
                                    id: {
                                        column: string;
                                    };
                                    name: {
                                        column: string;
                                    };
                                    passwordHash: {
                                        column: string;
                                    };
                                    role: {
                                        column: string;
                                    };
                                    tenantId: {
                                        column: string;
                                    };
                                    updatedAt: {
                                        column: string;
                                    };
                                };
                                namespaceId: string;
                                table: string;
                            };
                        };
                    };
                };
            };
        };
        execution: {
            executionHash: string;
            mutations: {
                defaults: {
                    onCreate: {
                        id: string;
                        kind: string;
                    };
                    onUpdate: {
                        id: string;
                        kind: string;
                    };
                    ref: {
                        column: string;
                        namespace: string;
                        table: string;
                    };
                }[];
            };
        };
        extensions: {};
        meta: {};
        profileHash: string;
        roots: {
            category: {
                model: string;
                namespace: string;
            };
            location: {
                model: string;
                namespace: string;
            };
            product: {
                model: string;
                namespace: string;
            };
            supplier: {
                model: string;
                namespace: string;
            };
            tenant: {
                model: string;
                namespace: string;
            };
            user: {
                model: string;
                namespace: string;
            };
        };
        schemaVersion: string;
        storage: {
            namespaces: {
                public: {
                    entries: {
                        table: {
                            category: {
                                columns: {
                                    createdAt: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    id: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    name: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    tenantId: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    updatedAt: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                };
                                foreignKeys: {
                                    onDelete: string;
                                    source: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                    target: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                }[];
                                indexes: {
                                    columns: string[];
                                    name: string;
                                    prefix: string;
                                    unique: boolean;
                                }[];
                                primaryKey: {
                                    columns: string[];
                                };
                                uniques: {
                                    columns: string[];
                                }[];
                            };
                            location: {
                                columns: {
                                    code: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    createdAt: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    id: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    name: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    tenantId: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    updatedAt: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                };
                                foreignKeys: {
                                    onDelete: string;
                                    source: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                    target: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                }[];
                                indexes: {
                                    columns: string[];
                                    name: string;
                                    prefix: string;
                                    unique: boolean;
                                }[];
                                primaryKey: {
                                    columns: string[];
                                };
                                uniques: {
                                    columns: string[];
                                }[];
                            };
                            product: {
                                columns: {
                                    categoryId: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    cost: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    createdAt: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    description: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    id: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    locationId: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    minStock: {
                                        codecId: string;
                                        default: {
                                            kind: string;
                                            value: number;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    name: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    price: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    stock: {
                                        codecId: string;
                                        default: {
                                            kind: string;
                                            value: number;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    supplierId: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    tenantId: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    unit: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    updatedAt: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                };
                                foreignKeys: {
                                    onDelete: string;
                                    source: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                    target: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                }[];
                                indexes: {
                                    columns: string[];
                                    name: string;
                                    prefix: string;
                                    unique: boolean;
                                }[];
                                primaryKey: {
                                    columns: string[];
                                };
                                uniques: never[];
                            };
                            supplier: {
                                columns: {
                                    createdAt: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    email: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    id: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    name: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    phone: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    tenantId: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    updatedAt: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                };
                                foreignKeys: {
                                    onDelete: string;
                                    source: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                    target: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                }[];
                                indexes: {
                                    columns: string[];
                                    name: string;
                                    prefix: string;
                                    unique: boolean;
                                }[];
                                primaryKey: {
                                    columns: string[];
                                };
                                uniques: never[];
                            };
                            tenant: {
                                columns: {
                                    createdAt: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    id: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    name: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    slug: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    updatedAt: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                };
                                foreignKeys: never[];
                                indexes: never[];
                                primaryKey: {
                                    columns: string[];
                                };
                                uniques: {
                                    columns: string[];
                                }[];
                            };
                            user: {
                                checks: {
                                    expression: string;
                                    name: string;
                                    prefix: string;
                                }[];
                                columns: {
                                    createdAt: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    email: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    id: {
                                        codecId: string;
                                        default: {
                                            expression: string;
                                            kind: string;
                                        };
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    name: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    passwordHash: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    role: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                        valueSet: {
                                            entityKind: string;
                                            entityName: string;
                                            namespaceId: string;
                                            plane: string;
                                        };
                                    };
                                    tenantId: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                    updatedAt: {
                                        codecId: string;
                                        nativeType: string;
                                        nullable: boolean;
                                    };
                                };
                                foreignKeys: {
                                    onDelete: string;
                                    source: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                    target: {
                                        columns: string[];
                                        namespaceId: string;
                                        tableName: string;
                                    };
                                }[];
                                indexes: {
                                    columns: string[];
                                    name: string;
                                    prefix: string;
                                    unique: boolean;
                                }[];
                                primaryKey: {
                                    columns: string[];
                                };
                                uniques: {
                                    columns: string[];
                                }[];
                            };
                        };
                        valueSet: {
                            user_role: {
                                kind: string;
                                values: string[];
                            };
                        };
                    };
                    id: string;
                    kind: string;
                };
            };
            storageHash: string;
        };
        target: string;
        targetFamily: string;
    };
    get operations(): Promise<import("@prisma/orm-family-sql/family/control").SqlMigrationPlanOperation<import("node_modules/@prisma/orm-target-postgres/dist/planner-target-details-HkP4RrRO-_xPQVPF0.mjs").t>>[];
}
