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

export type ObjectValueType<T extends DocumentData> = ValueOf<
  {
    [k0 in keyof T]:
      | T[k0]
      | (T[k0] extends DocumentData ? ObjectValueType<T[k0]> : never);
  }
>;

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
  | {
      [field in string]: firestorePrimitiveType | Array<firestorePrimitiveType>;
    }
  | null
  | firestore.CollectionReference
  | firestore.DocumentReference
  | string;

export type UpdateData = { [fieldPath in string]: any };

type TypedFirebaseFirestore<col extends CollectionData> = {
  settings(settings: firestore.Settings): void;

  enablePersistence(settings?: firestore.PersistenceSettings): Promise<void>;

  collection: <collectionPath extends keyof col>(
    collectionPath: collectionPath
  ) => TypedCollectionReference<col[collectionPath]>;

  doc: <documentPath extends keyof col>(
    documentPath: documentPath
  ) => TypedDocumentReference<col[documentPath]>;

  collectionGroup(collectionId: string): Query<any>;

  runTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ): Promise<T>;

  batch(): WriteBatch;

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
};

export type Transaction = {
  get<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: TypedDocumentReference<docAndSub>
  ): Promise<DocumentSnapshot<docAndSub["doc"]>>;

  set<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: TypedDocumentReference<docAndSub>,
    data: docAndSub["doc"],
    options?: firestore.SetOptions
  ): Transaction;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: TypedDocumentReference<docAndSub>,
    data: UpdateData
  ): Transaction;

  update<
    docAndSub extends DocumentAndSubCollectionData,
    path extends keyof docAndSub["doc"] & string
  >(
    documentRef: TypedDocumentReference<docAndSub>,
    field: path,
    value: docAndSub["doc"][path],
    ...moreFieldsAndValues: any[]
  ): Transaction;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: TypedDocumentReference<docAndSub>,
    field: firestore.FieldPath,
    value: ObjectValueType<docAndSub["doc"]>,
    ...moreFieldsAndValues: any[]
  ): Transaction;

  delete(documentRef: firestore.DocumentReference): Transaction;
};

type WriteBatch = {
  set<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: TypedDocumentReference<docAndSub>,
    data: docAndSub["doc"],
    options?: firestore.SetOptions
  ): WriteBatch;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: TypedDocumentReference<docAndSub>,
    data: docAndSub["doc"]
  ): WriteBatch;

  update<
    docAndSub extends DocumentAndSubCollectionData,
    path extends keyof docAndSub["doc"] & string
  >(
    documentRef: TypedDocumentReference<docAndSub>,
    field: path,
    value: docAndSub["doc"][path],
    ...moreFieldsAndValues: any[]
  ): WriteBatch;

  update<docAndSub extends DocumentAndSubCollectionData>(
    documentRef: TypedDocumentReference<docAndSub>,
    field: firestore.FieldPath,
    value: ObjectValueType<docAndSub["doc"]>,
    ...moreFieldsAndValues: any[]
  ): WriteBatch;

  delete(documentRef: firestore.DocumentReference): WriteBatch;

  commit(): Promise<void>;
};

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

  set(data: DocumentData, options?: firestore.SetOptions): Promise<void>;

  update(data: UpdateData): Promise<void>;

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

  delete(): Promise<void>;

  get(
    options?: firestore.GetOptions
  ): Promise<DocumentSnapshot<docAndSub["doc"]>>;

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
}

export type DocumentSnapshot<doc extends DocumentData> = {
  readonly exists: boolean;
  readonly ref: TypedDocumentReference<{ doc: doc; col: any }>;
  readonly id: string;
  readonly metadata: firestore.SnapshotMetadata;

  data(options?: firestore.SnapshotOptions): doc | undefined;

  get<path extends keyof doc & string>(
    fieldPath: path,
    options?: firestore.SnapshotOptions
  ): doc[path] | undefined;
  get(
    fieldPath: firestore.FieldPath,
    options?: firestore.SnapshotOptions
  ): ObjectValueType<doc> | undefined;

  isEqual(other: DocumentSnapshot<doc>): boolean;
};

export type QueryDocumentSnapshot<doc extends DocumentData> = DocumentSnapshot<
  doc
> & {
  data(options?: firestore.SnapshotOptions): doc;
};

export type Query<doc extends DocumentData> = {
  readonly firestore: TypedFirebaseFirestore<any>;

  where<path extends keyof doc & string>(
    fieldPath: path,
    opStr: firestore.WhereFilterOp,
    value: doc[path]
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

  get(options?: firestore.GetOptions): Promise<QuerySnapshot<doc>>;

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

  docChanges(
    options?: firestore.SnapshotListenOptions
  ): Array<DocumentChange<doc>>;

  forEach(
    callback: (result: QueryDocumentSnapshot<doc>) => void,
    thisArg?: any
  ): void;

  isEqual(other: QuerySnapshot<doc>): boolean;
};

export type DocumentChange<doc extends DocumentData> = {
  readonly type: firestore.DocumentChangeType;
  readonly doc: QueryDocumentSnapshot<any>;
  readonly oldIndex: number;
  readonly newIndex: number;
};

export type TypedCollectionReference<
  docAndSub extends DocumentAndSubCollectionData
> = Query<docAndSub["doc"]> & {
  readonly id: string;
  readonly parent: TypedDocumentReference<docAndSub> | null;
  readonly path: string;

  doc(documentPath?: string): TypedDocumentReference<docAndSub>;

  add(data: docAndSub["doc"]): Promise<TypedDocumentReference<docAndSub>>;

  isEqual(other: TypedCollectionReference<docAndSub>): boolean;
};

export type FieldValueValue =
  | "serverTimestamp"
  | "delete"
  | "arrayUnion"
  | "arrayRemove"
  | "increment";

export class FieldValue<value extends FieldValueValue> {
  private constructor();

  static serverTimestamp(): FieldValue<"serverTimestamp">;

  static delete(): FieldValue<"delete">;

  static arrayUnion(...elements: any[]): FieldValue<"arrayUnion">;

  static arrayRemove(...elements: any[]): FieldValue<"arrayRemove">;

  static increment(n: number): FieldValue<"increment">;

  isEqual(other: FieldValue<any>): boolean;
}
