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

import * as firebaseApp from "@firebase/app-types";
import * as firestore from "@firebase/firestore-types";

type ValueOf<T> = T[keyof T];

export type ObjectValueType<T extends DocumentData> = ValueOf<
  {
    [k0 in keyof T]:
      | T[k0]
      | (T[k0] extends DocumentData ? ObjectValueType<T[k0]> : never);
  }
>;

export type DocumentData = {
  [field in string]:
    | firestorePrimitiveType
    | Array<firestorePrimitiveType>
    | ReadonlyArray<firestorePrimitiveType>;
};

export type CollectionData = {
  [key in string]: DocumentAndSubCollectionData;
};

export type DocumentAndSubCollectionData = {
  doc: DocumentData;
  col: CollectionData;
};

type GetIncludeDocument<col extends CollectionData> = ValueOf<
  { [key in keyof col]: col[key]["doc"] | GetIncludeDocument<col[key]["col"]> }
>;

type firestorePrimitiveType =
  | boolean
  | firestore.Blob
  | firestore.Timestamp
  | number
  | firestore.GeoPoint
  | {
      [field in string]:
        | firestorePrimitiveType
        | Array<firestorePrimitiveType>
        | ReadonlyArray<firestorePrimitiveType>;
    }
  | null
  | firestore.CollectionReference
  | firestore.DocumentReference
  | string;

export type UpdateData<doc extends DocumentData> = Partial<
  { [key in keyof doc]: key | firestore.FieldValue }
>;

type FirebaseFirestore<col extends CollectionData> = {
  readonly settings: (settings: firestore.Settings) => void;

  readonly enablePersistence: (
    settings?: firestore.PersistenceSettings
  ) => Promise<void>;

  readonly collection: <collectionPath extends keyof col>(
    collectionPath: collectionPath
  ) => CollectionReference<col[collectionPath]>;

  readonly doc: <documentPath extends keyof col>(
    documentPath: documentPath
  ) => DocumentReference<col[documentPath]>;

  readonly collectionGroup: (collectionId: string) => Query<any>;

  readonly runTransaction: <T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ) => Promise<T>;

  readonly batch: () => WriteBatch;

  readonly app: firebaseApp.FirebaseApp;

  readonly clearPersistence: () => Promise<void>;

  readonly enableNetwork: () => Promise<void>;

  readonly disableNetwork: () => Promise<void>;

  readonly waitForPendingWrites: () => Promise<void>;

  onSnapshotsInSync(observer: {
    next?: (value: void) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }): () => void;
  onSnapshotsInSync(onSync: () => void): () => void;

  readonly terminate: () => Promise<void>;

  readonly INTERNAL: { delete: () => Promise<void> };
};

export type Transaction = {
  readonly get: <docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>
  ) => Promise<DocumentSnapshot<docAndSub["doc"]>>;

  set: <docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: docAndSub["doc"],
    options?: firestore.SetOptions
  ) => Transaction;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: UpdateData<docAndSub["doc"]>
  ): Transaction;

  update<
    docAndSub extends DocumentAndSubCollectionData,
    path extends keyof docAndSub["doc"] & string
  >(
    documentRef: DocumentReference<docAndSub>,
    field: path,
    value: docAndSub["doc"][path],
    ...moreFieldsAndValues: any[]
  ): Transaction;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    field: firestore.FieldPath,
    value: ObjectValueType<docAndSub["doc"]>,
    ...moreFieldsAndValues: any[]
  ): Transaction;

  readonly delete: (documentRef: firestore.DocumentReference) => Transaction;
};

type WriteBatch = {
  set: <docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: docAndSub["doc"],
    options?: firestore.SetOptions
  ) => WriteBatch;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    data: docAndSub["doc"]
  ): WriteBatch;

  update<
    docAndSub extends DocumentAndSubCollectionData,
    path extends keyof docAndSub["doc"] & string
  >(
    documentRef: DocumentReference<docAndSub>,
    field: path,
    value: docAndSub["doc"][path],
    ...moreFieldsAndValues: any[]
  ): WriteBatch;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: DocumentReference<docAndSub>,
    field: firestore.FieldPath,
    value: ObjectValueType<docAndSub["doc"]>,
    ...moreFieldsAndValues: any[]
  ): WriteBatch;

  readonly delete: (documentRef: firestore.DocumentReference) => WriteBatch;

  readonly commit: () => Promise<void>;
};

export type DocumentReference<
  docAndSub extends DocumentAndSubCollectionData
> = {
  readonly id: string;
  readonly firestore: FirebaseFirestore<any>;
  readonly parent: CollectionReference<docAndSub>;
  readonly path: string;

  readonly collection: <collectionPath extends keyof docAndSub["col"]>(
    collectionPath: collectionPath
  ) => CollectionReference<docAndSub["col"][collectionPath]>;

  readonly isEqual: (other: DocumentReference<docAndSub>) => boolean;

  readonly set: (
    data: DocumentData,
    options?: firestore.SetOptions
  ) => Promise<void>;

  update(data: UpdateData<docAndSub["doc"]>): Promise<void>;

  update<path extends keyof docAndSub["doc"] & string>(
    field: path,
    value: docAndSub["doc"][path],
    ...moreFieldsAndValues: any[]
  ): Promise<void>;

  update(
    field: firestore.FieldPath,
    value: ObjectValueType<docAndSub["doc"]>,
    ...moreFieldsAndValues: any[]
  ): Promise<void>;

  readonly delete: () => Promise<void>;

  readonly get: (
    options?: firestore.GetOptions
  ) => Promise<DocumentSnapshot<docAndSub["doc"]>>;

  onSnapshot(observer: {
    next?: (snapshot: DocumentSnapshot<docAndSub["doc"]>) => void;
    error?: (error: firestore.FirestoreError) => void;
    complete?: () => void;
  }): () => void;

  onSnapshot(
    options: firestore.SnapshotListenOptions,
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
    options: firestore.SnapshotListenOptions,
    onNext: (snapshot: DocumentSnapshot<docAndSub["doc"]>) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;
};

export type DocumentSnapshot<doc extends DocumentData> = {
  readonly exists: boolean;
  readonly ref: DocumentReference<{ doc: doc; col: any }>;
  readonly id: string;
  readonly metadata: firestore.SnapshotMetadata;

  readonly data: (options?: firestore.SnapshotOptions) => doc | undefined;

  get<path extends keyof doc & string>(
    fieldPath: path,
    options?: firestore.SnapshotOptions
  ): doc[path] | undefined;
  get(
    fieldPath: firestore.FieldPath,
    options?: firestore.SnapshotOptions
  ): ObjectValueType<doc> | undefined;

  readonly isEqual: (other: DocumentSnapshot<doc>) => boolean;
};

interface QueryDocumentSnapshot<doc extends DocumentData>
  extends DocumentSnapshot<doc> {
  readonly data: (options?: firestore.SnapshotOptions) => doc;
}

export type Query<doc extends DocumentData> = {
  readonly firestore: FirebaseFirestore<any>;

  where<path extends keyof doc & string>(
    fieldPath: path,
    opStr: "<" | "<=" | "==" | ">=" | ">",
    value: doc[path]
  ): Query<doc>;

  where<path extends keyof doc & string>(
    fieldPath: path,
    opStr: "array-contains",
    value: doc[path] extends Array<infer V> ? V : never
  ): Query<doc>;

  where<path extends keyof doc & string>(
    fieldPath: path,
    opStr: "in",
    value: Array<doc[path]>
  ): Query<doc>;

  where<path extends keyof doc & string>(
    fieldPath: path,
    opStr: "array-contains-any",
    value: doc[path] extends Array<infer V> ? Array<V> : never
  ): Query<doc>;

  where(
    fieldPath: firestore.FieldPath,
    opStr: firestore.WhereFilterOp,
    value: ObjectValueType<doc>
  ): Query<doc>;

  orderBy<path extends keyof doc & string>(
    fieldPath: path,
    directionStr?: firestore.OrderByDirection
  ): Query<doc>;

  orderBy(
    fieldPath: firestore.FieldPath,
    directionStr?: firestore.OrderByDirection
  ): Query<doc>;

  readonly limit: (limit: number) => Query<doc>;

  readonly limitToLast: (limit: number) => Query<doc>;

  startAt(snapshot: DocumentSnapshot<doc>): Query<doc>;
  startAt(...fieldValues: any[]): Query<doc>;

  startAfter(snapshot: DocumentSnapshot<doc>): Query<doc>;
  startAfter(...fieldValues: any[]): Query<doc>;

  endBefore(snapshot: DocumentSnapshot<doc>): Query<doc>;
  endBefore(...fieldValues: any[]): Query<doc>;

  endAt(snapshot: DocumentSnapshot<doc>): Query<doc>;
  endAt(...fieldValues: any[]): Query<doc>;

  readonly isEqual: (other: Query<doc>) => boolean;

  readonly get: (options?: firestore.GetOptions) => Promise<QuerySnapshot<doc>>;

  onSnapshot(observer: {
    next?: (snapshot: QuerySnapshot<doc>) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }): () => void;
  onSnapshot(
    options: firestore.SnapshotListenOptions,
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
    options: firestore.SnapshotListenOptions,
    onNext: (snapshot: QuerySnapshot<doc>) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void
  ): () => void;
};

type QuerySnapshot<doc extends DocumentData> = {
  readonly query: Query<doc>;
  readonly metadata: firestore.SnapshotMetadata;
  readonly docs: QueryDocumentSnapshot<doc>[];
  readonly size: number;
  readonly empty: boolean;

  readonly docChanges: (
    options?: firestore.SnapshotListenOptions
  ) => ReadonlyArray<DocumentChange<doc>>;

  readonly forEach: (
    callback: (result: QueryDocumentSnapshot<doc>) => void,
    thisArg?: any
  ) => void;

  readonly isEqual: (other: QuerySnapshot<doc>) => boolean;
};

export type DocumentChange<doc extends DocumentData> = {
  readonly type: firestore.DocumentChangeType;
  readonly doc: QueryDocumentSnapshot<any>;
  readonly oldIndex: number;
  readonly newIndex: number;
};

export type CollectionReference<
  docAndSub extends DocumentAndSubCollectionData
> = Query<docAndSub["doc"]> & {
  readonly id: string;
  readonly parent: DocumentReference<docAndSub> | null;
  readonly path: string;

  readonly doc: (documentPath?: string) => DocumentReference<docAndSub>;

  readonly add: (
    data: docAndSub["doc"]
  ) => Promise<DocumentReference<docAndSub>>;

  readonly isEqual: (other: CollectionReference<docAndSub>) => boolean;
};
