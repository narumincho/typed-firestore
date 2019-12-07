/**
 * @license
 * 2019 narumincho
 *
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { FirebaseApp, FirebaseNamespace } from "@firebase/app-types";
import * as firestore from "@firebase/firestore-types";

type ValueOf<T> = T[keyof T];

type ObjectToFiledPath<T extends DocumentData> = ValueOf<
  {
    [k0 in keyof T]:
      | [k0]
      | (T[k0] extends DocumentData
          ? ValueOf<
              {
                [k1 in keyof T[k0]]:
                  | [k0, k1]
                  | (T[k0][k1] extends DocumentData
                      ? ValueOf<
                          {
                            [k2 in keyof T[k0][k1]]:
                              | [k0, k1, k2]
                              | (T[k0][k1][k2] extends DocumentData
                                  ? ValueOf<
                                      {
                                        [k3 in keyof T[k0][k1][k2]]:
                                          | [k0, k1, k2, k3]
                                          | (T[k0][k1][k2][k3] extends DocumentData
                                              ? [
                                                  k0,
                                                  k1,
                                                  k2,
                                                  k3,
                                                  keyof T[k0][k1][k2][k3]
                                                ]
                                              : never);
                                      }
                                    >
                                  : never);
                          }
                        >
                      : never);
              }
            >
          : never);
  }
>;

export type R = ObjectToFiledPath<{
  user: {
    name: string;
    id: string;
    age: number;
    account: {
      id: string;
      service: string;
      nest: { nestNest: { nestNestNest: { superNest: number } } };
    };
  };
  project: { name: string; createdAt: number };
}>;

type Sample = ObjectToFiledPath<{
  sampleId: { name: string; id: string; age: number };
}>;
/*

→
["sampleId"] | ["sample", "name"] | ["sample", "id"]

*/

export type DocumentData = {
  [field in string]: firestorePrimitiveType | Array<firestorePrimitiveType>;
};

export type CollectionData = {
  [key in string]: DocumentAndSubCollectionData;
};

export type DocumentAndSubCollectionData = {
  doc: DocumentData;
  col: CollectionData;
};

type firestorePrimitiveType =
  | boolean
  | firestore.Blob
  | firestore.Timestamp
  | number
  | firestore.GeoPoint
  | { [field in string]: firestorePrimitiveType }
  | null
  | firestore.CollectionReference
  | firestore.DocumentReference
  | string;

export type UpdateData = { [fieldPath in string]: any };

export interface Settings {
  host?: string;
  ssl?: boolean;
  timestampsInSnapshots?: boolean;
  cacheSizeBytes?: number;
  experimentalForceLongPolling?: boolean;
}

export interface PersistenceSettings {
  synchronizeTabs?: boolean;
  experimentalTabSynchronization?: boolean;
}

export class TypedFirebaseFirestore<col extends CollectionData> {
  private constructor();

  settings(settings: Settings): void;

  enablePersistence(settings?: PersistenceSettings): Promise<void>;

  collection: <collectionPath extends keyof col>(
    collectionPath: collectionPath
  ) => TypedCollectionReference<col[collectionPath]>;

  doc: <documentPath extends keyof col>(
    documentPath: documentPath
  ) => TypedDocumentReference<col[documentPath]>;

  collectionGroup(collectionId: string): Query<any>;

  runTransaction<T>(
    updateFunction: (
      transaction: Transaction<{ doc: {}; col: col }>
    ) => Promise<T>
  ): Promise<T>;

  batch(): WriteBatch<any>;

  app: any;

  clearPersistence(): Promise<void>;

  enableNetwork(): Promise<void>;

  disableNetwork(): Promise<void>;

  waitForPendingWrites(): Promise<void>;

  onSnapshotsInSync(observer: {
    next?: (value: void) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }): () => void;
  onSnapshotsInSync(onSync: () => void): () => void;

  terminate(): Promise<void>;

  INTERNAL: { delete: () => Promise<void> };
}

export class GeoPoint {
  constructor(latitude: number, longitude: number);

  readonly latitude: number;
  readonly longitude: number;

  isEqual(other: GeoPoint): boolean;
}

export class Timestamp {
  constructor(seconds: number, nanoseconds: number);

  static now(): Timestamp;

  static fromDate(date: Date): Timestamp;

  static fromMillis(milliseconds: number): Timestamp;

  readonly seconds: number;
  readonly nanoseconds: number;

  toDate(): Date;

  toMillis(): number;

  isEqual(other: Timestamp): boolean;
}

export class Blob {
  private constructor();

  static fromBase64String(base64: string): Blob;

  static fromUint8Array(array: Uint8Array): Blob;

  public toBase64(): string;

  public toUint8Array(): Uint8Array;

  isEqual(other: Blob): boolean;
}

export class Transaction<docAndSub extends DocumentAndSubCollectionData> {
  private constructor();

  get(
    documentRef: TypedDocumentReference<docAndSub>
  ): Promise<DocumentSnapshot<docAndSub["doc"]>>;

  set(
    documentRef: TypedDocumentReference<docAndSub>,
    data: DocumentData,
    options?: SetOptions
  ): Transaction<docAndSub>;

  update(
    documentRef: TypedDocumentReference<docAndSub>,
    data: UpdateData
  ): Transaction<docAndSub>;
  update(
    documentRef: TypedDocumentReference<docAndSub>,
    field: string | FieldPath,
    value: any,
    ...moreFieldsAndValues: any[]
  ): Transaction<docAndSub>;

  delete(
    documentRef: TypedDocumentReference<docAndSub>
  ): Transaction<docAndSub>;
}

export class WriteBatch<docAndSub extends DocumentAndSubCollectionData> {
  private constructor();

  set(
    documentRef: TypedDocumentReference<docAndSub>,
    data: DocumentData,
    options?: SetOptions
  ): WriteBatch<docAndSub>;

  update(
    documentRef: TypedDocumentReference<docAndSub>,
    data: UpdateData
  ): WriteBatch<docAndSub>;
  update(
    documentRef: TypedDocumentReference<docAndSub>,
    field: string | FieldPath,
    value: any,
    ...moreFieldsAndValues: any[]
  ): WriteBatch<docAndSub>;

  delete(documentRef: TypedDocumentReference<docAndSub>): WriteBatch<docAndSub>;

  commit(): Promise<void>;
}

export interface SnapshotListenOptions {
  readonly includeMetadataChanges?: boolean;
}

export interface SetOptions {
  readonly merge?: boolean;
  readonly mergeFields?: (string | FieldPath)[];
}

export interface GetOptions {
  readonly source?: "default" | "server" | "cache";
}

export class TypedDocumentReference<
  docAndSub extends DocumentAndSubCollectionData
> {
  private constructor();

  readonly id: string;
  readonly firestore: TypedFirebaseFirestore<any>;
  readonly parent: TypedCollectionReference<docAndSub>;
  readonly path: string;

  collection: <collectionPath extends keyof docAndSub["col"]>(
    collectionPath: collectionPath
  ) => TypedCollectionReference<docAndSub["col"][collectionPath]>;

  isEqual(other: TypedDocumentReference<docAndSub>): boolean;

  set(data: DocumentData, options?: SetOptions): Promise<void>;

  update(data: UpdateData): Promise<void>;
  update(
    field: string | FieldPath,
    value: any,
    ...moreFieldsAndValues: any[]
  ): Promise<void>;

  delete(): Promise<void>;

  get(options?: GetOptions): Promise<DocumentSnapshot<docAndSub["doc"]>>;

  onSnapshot(observer: {
    next?: (snapshot: DocumentSnapshot<docAndSub["doc"]>) => void;
    error?: (error: FirestoreError) => void;
    complete?: () => void;
  }): () => void;
  onSnapshot(
    options: SnapshotListenOptions,
    observer: {
      next?: (snapshot: DocumentSnapshot<docAndSub["doc"]>) => void;
      error?: (error: Error) => void;
      complete?: () => void;
    }
  ): () => void;
  onSnapshot(
    onNext: (snapshot: DocumentSnapshot<docAndSub["doc"]>) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;
  onSnapshot(
    options: SnapshotListenOptions,
    onNext: (snapshot: DocumentSnapshot<docAndSub["doc"]>) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;
}

export interface SnapshotOptions {
  readonly serverTimestamps?: "estimate" | "previous" | "none";
}

/** Metadata about a snapshot, describing the state of the snapshot. */
export interface SnapshotMetadata {
  readonly hasPendingWrites: boolean;
  readonly fromCache: boolean;

  isEqual(other: SnapshotMetadata): boolean;
}

export class DocumentSnapshot<doc extends DocumentData> {
  protected constructor();

  readonly exists: boolean;
  readonly ref: TypedDocumentReference<{ doc: doc; col: any }>;
  readonly id: string;
  readonly metadata: SnapshotMetadata;

  data(options?: SnapshotOptions): doc | undefined;

  get(fieldPath: string | FieldPath, options?: SnapshotOptions): any;

  isEqual(other: DocumentSnapshot<doc>): boolean;
}

export class QueryDocumentSnapshot<
  doc extends DocumentData
> extends DocumentSnapshot<doc> {
  private constructor();
  data(options?: SnapshotOptions): doc;
}

export type WhereFilterOp =
  | "<"
  | "<="
  | "=="
  | ">="
  | ">"
  | "array-contains"
  | "in"
  | "array-contains-any";

export class Query<doc extends DocumentData> {
  protected constructor();

  readonly firestore: TypedFirebaseFirestore<any>;

  where(
    fieldPath: string | FieldPath,
    opStr: WhereFilterOp,
    value: any
  ): Query<doc>;

  orderBy(
    fieldPath: string | FieldPath,
    directionStr?: firestore.OrderByDirection
  ): Query<doc>;

  limit(limit: number): Query<doc>;

  limitToLast(limit: number): Query<doc>;

  startAt(snapshot: DocumentSnapshot<doc>): Query<doc>;
  startAt(...fieldValues: any[]): Query<doc>;

  startAfter(snapshot: DocumentSnapshot<doc>): Query<doc>;
  startAfter(...fieldValues: any[]): Query<doc>;

  endBefore(snapshot: DocumentSnapshot<doc>): Query<doc>;
  endBefore(...fieldValues: any[]): Query<doc>;

  endAt(snapshot: DocumentSnapshot<doc>): Query<doc>;
  endAt(...fieldValues: any[]): Query<doc>;

  isEqual(other: Query<doc>): boolean;

  get(options?: GetOptions): Promise<QuerySnapshot<doc>>;

  onSnapshot(observer: {
    next?: (snapshot: QuerySnapshot<doc>) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }): () => void;
  onSnapshot(
    options: SnapshotListenOptions,
    observer: {
      next?: (snapshot: QuerySnapshot<doc>) => void;
      error?: (error: Error) => void;
      complete?: () => void;
    }
  ): () => void;
  onSnapshot(
    onNext: (snapshot: QuerySnapshot<doc>) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;
  onSnapshot(
    options: SnapshotListenOptions,
    onNext: (snapshot: QuerySnapshot<doc>) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;
}

export class QuerySnapshot<doc extends DocumentData> {
  private constructor();

  readonly query: Query<doc>;
  readonly metadata: SnapshotMetadata;
  readonly docs: QueryDocumentSnapshot<doc>[];
  readonly size: number;
  readonly empty: boolean;

  docChanges(options?: SnapshotListenOptions): DocumentChange[];

  forEach(
    callback: (result: QueryDocumentSnapshot<doc>) => void,
    thisArg?: any
  ): void;

  isEqual(other: QuerySnapshot<doc>): boolean;
}

export interface DocumentChange {
  readonly type: firestore.DocumentChangeType;
  readonly doc: QueryDocumentSnapshot<any>;
  readonly oldIndex: number;
  readonly newIndex: number;
}

export class TypedCollectionReference<
  docAndSub extends DocumentAndSubCollectionData
> extends Query<docAndSub["doc"]> {
  private constructor();

  readonly id: string;
  readonly parent: TypedDocumentReference<docAndSub> | null;
  readonly path: string;

  doc(documentPath?: string): TypedDocumentReference<docAndSub>;

  add(data: DocumentData): Promise<TypedDocumentReference<docAndSub>>;

  isEqual(other: TypedCollectionReference<docAndSub>): boolean;
}

export class FieldValue {
  private constructor();

  static serverTimestamp(): FieldValue;

  static delete(): FieldValue;

  static arrayUnion(...elements: any[]): FieldValue;

  static arrayRemove(...elements: any[]): FieldValue;

  static increment(n: number): FieldValue;

  isEqual(other: FieldValue): boolean;
}

export class FieldPath {
  constructor(...fieldNames: string[]);

  static documentId(): FieldPath;

  isEqual(other: FieldPath): boolean;
}

export interface FirestoreError {
  code: firestore.FirestoreErrorCode;
  message: string;
  name: string;
  stack?: string;
}
